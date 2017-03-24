import { recognizerLogger as logger } from '../../../configuration/LoggerConfig';
import MyScriptJSConstants from '../../../configuration/MyScriptJSConstants';
import * as InkModel from '../../../model/InkModel';
import * as StrokeComponent from '../../../model/StrokeComponent';
import * as CdkCommonUtil from '../../common/CdkCommonUtil';
import * as Cdkv3WSWebsocketBuilder from './Cdkv3WSBuilder';
import * as CdkWSRecognizerUtil from '../CdkWSRecognizerUtil';
import * as Cdkv3CommonMathRecognizer from '../../common/v3/Cdkv3CommonMathRecognizer';

export { close } from '../CdkWSRecognizerUtil';

/**
 * Recognizer configuration
 * @type {RecognizerInfo}
 */
export const mathWebSocketV3Configuration = {
  types: [MyScriptJSConstants.RecognitionType.MATH],
  protocol: MyScriptJSConstants.Protocol.WEBSOCKET,
  apiVersion: 'V3',
  availableFeatures: [MyScriptJSConstants.RecognizerFeature.RECOGNITION],
  availableTriggers: [MyScriptJSConstants.RecognitionTrigger.POINTER_UP],
  preferredTrigger: MyScriptJSConstants.RecognitionTrigger.POINTER_UP
};

/**
 * Get the configuration supported by this recognizer
 * @return {RecognizerInfo}
 */
export function getInfo() {
  return mathWebSocketV3Configuration;
}

function buildInitMessage(recognizerContext, model, configuration) {
  return {
    type: 'applicationKey',
    applicationKey: configuration.recognitionParams.server.applicationKey
  };
}

function buildMathInput(recognizerContext, model, configuration) {
  if (recognizerContext.lastRecognitionPositions.lastSentPosition < 0) {
    return {
      type: 'start',
      parameters: configuration.recognitionParams.v3.mathParameter,
      components: model.rawStrokes.map(stroke => StrokeComponent.toJSON(stroke))
    };
  }

  return {
    type: 'continue',
    components: InkModel.extractPendingStrokes(model, -1).map(stroke => StrokeComponent.toJSON(stroke))
  };
}

function buildResetMessage(recognizerContext, model, configuration) {
  return {
    type: 'reset'
  };
}

function resultCallback(model) {
  logger.debug('Cdkv3WSMathRecognizer result callback', model);
  const modelReference = model;
  modelReference.recognizedSymbols = Cdkv3CommonMathRecognizer.extractRecognizedSymbols(model);
  modelReference.recognitionResult = CdkCommonUtil.extractRecognitionResult(model);
  logger.debug('Cdkv3WSMathRecognizer model updated', modelReference);
  return modelReference;
}

/**
 * Initialize recognition
 * @param {Configuration} configuration Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {function(err: Object, res: Object)} callback
 */
export function init(configuration, model, recognizerContext, callback) {
  const initCallback = (err, res) => {
    if (!err && (InkModel.extractPendingStrokes(res).length > 0)) {
      CdkWSRecognizerUtil.sendMessages(configuration, InkModel.updateModelSentPosition(res), recognizerContext, callback, buildMathInput);
    } else {
      callback(err, res);
    }
  };

  CdkWSRecognizerUtil.init('/api/v3.0/recognition/ws/math', configuration, InkModel.resetModelPositions(model), recognizerContext, Cdkv3WSWebsocketBuilder.buildWebSocketCallback, init)
      .then(openedModel => CdkWSRecognizerUtil.sendMessages(configuration, openedModel, recognizerContext, initCallback, buildInitMessage))
      .catch(err => callback(err, model)); // Error on websocket creation
}

/**
 * Do the recognition
 * @param {Configuration} configuration Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {function(err: Object, res: Object)} callback
 */
export function recognize(configuration, model, recognizerContext, callback) {
  CdkWSRecognizerUtil.sendMessages(configuration, InkModel.updateModelSentPosition(model), recognizerContext, (err, res) => callback(err, resultCallback(res)), buildMathInput);
}

/**
 * Reset the recognition context
 * @param {Configuration} configuration Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {function(err: Object, res: Object)} callback
 */
export function reset(configuration, model, recognizerContext, callback) {
  CdkWSRecognizerUtil.sendMessages(configuration, InkModel.resetModelPositions(model), recognizerContext, (err, res) => callback(err, resultCallback(res)), buildResetMessage);
}

/**
 * Clear the recognition context
 * @param {Configuration} configuration Current configuration
 * @param {Model} model Current model
 * @param {RecognizerContext} recognizerContext Current recognizer context
 * @param {function(err: Object, res: Object)} callback
 */
export function clear(configuration, model, recognizerContext, callback) {
  CdkWSRecognizerUtil.sendMessages(configuration, InkModel.clearModel(model), recognizerContext, (err, res) => callback(err, resultCallback(res)), buildResetMessage);
}
