import { recognizerLogger as logger } from '../../../configuration/LoggerConfig';
import * as NetworkWSInterface from '../networkWSInterface';
import * as CryptoHelper from '../../CryptoHelper';
import * as InkModel from '../../../model/InkModel';
import * as CdkWSRecognizerUtil from '../CdkWSRecognizerUtil';

/**
 * A CDK v4 websocket dialog have this sequence :
 * ---------- Client ------------------------------------- Server ----------------------------------
 * init (send the new content package) ================>
 *                                       <=========== hmacChallenge
 * answerToHmacChallenge (send the hmac) =========>
 * newPart (send the parameters ) ===============>
 *                                       <=========== update
 * addStrokes (send the strokes ) ============>
 *                                       <=========== update
 */

function buildHmac(recognizerContext, message, configuration) {
  return {
    type: 'hmac',
    hmac: CryptoHelper.computeHmac(message.data.hmacChallenge, configuration.recognitionParams.server.applicationKey, configuration.recognitionParams.server.hmacKey)
  };
}

function modelResultCallback(recognizerContext, message) {
  logger.debug(`Cdkv4WSRecognizer ${message.data.type} message`, message);
  const recognitionContext = recognizerContext.recognitionContexts[recognizerContext.recognitionContexts.length - 1];

  const modelReference = InkModel.updateModelReceivedPosition(recognitionContext.model);
  if (message.data.updates !== undefined) {
    if (modelReference.recognizedSymbols) {
      modelReference.recognizedSymbols.push(...message.data.updates);
    } else {
      modelReference.recognizedSymbols = [...message.data.updates];
    }
    modelReference.rawResults.convert = message.data;
  }
  if (message.data.recognitionResult !== undefined) {
    modelReference.rawResults.recognition = message.data;
    modelReference.recognitionResult = message.data.recognitionResult;
  }
  if (message.data.canUndo !== undefined) {
    modelReference.rawResults.state = Object.assign(message.data, { canClear: message.data.canUndo && modelReference.rawStrokes.length > 0 });
  }

  logger.debug('Cdkv4WSRecognizer model updated', modelReference);
  // Giving back the hand to the editor by resolving the promise.
  recognitionContext.callback(undefined, modelReference);
}

/**
 * This function bind the right behaviour when a message is receive by the websocket.
 * @param {Configuration} configuration Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {DestructuredPromise} destructuredPromise
 * @return {function} Callback to handle WebSocket results
 */
export function buildWebSocketCallback(configuration, model, recognizerContext, destructuredPromise) {
  return (message) => {
    // Handle websocket messages
    logger.trace(`${message.type} websocket callback`, message);

    switch (message.type) {
      case 'open' :
        destructuredPromise.resolve(model);
        break;
      case 'message' :
        logger.trace('Receiving message', message.data.type);
        switch (message.data.type) {
          case 'ack':
            if (message.data.hmacChallenge) {
              NetworkWSInterface.send(recognizerContext, buildHmac(recognizerContext, message, configuration));
            }
            modelResultCallback(recognizerContext, Object.assign(message, { data: { canUndo: false, canRedo: false } }));
            break;
          case 'partChanged' :
          case 'newPart' :
          case 'styleClasses' :
            break;
          case 'contentChanged' :
          case 'svgPatch' :
            modelResultCallback(recognizerContext, message);
            break;
          case 'error' :
            CdkWSRecognizerUtil.errorCallBack({ msg: 'Websocket connection error', recoverable: false, serverMessage: message.data }, recognizerContext, destructuredPromise);
            break;
          default :
            CdkWSRecognizerUtil.simpleCallBack(message);
            destructuredPromise.reject('Unknown message', recognizerContext, destructuredPromise);
        }
        break;
      case 'close' :
        logger.debug('Websocket close done');
        CdkWSRecognizerUtil.closeCallback(message, recognizerContext, destructuredPromise);
        break;
      case 'error' :
        CdkWSRecognizerUtil.errorCallBack({ msg: 'Websocket connection error', recoverable: false }, recognizerContext, destructuredPromise);
        break;
      default :
        CdkWSRecognizerUtil.simpleCallBack(message);
    }
  };
}
