import { modelLogger as logger } from '../../../configuration/LoggerConfig';
import MyScriptJSConstants from '../../../configuration/MyScriptJSConstants';
import * as InkModel from '../../../model/InkModel';
import * as StrokeComponent from '../../../model/StrokeComponent';
import * as CryptoHelper from '../../CryptoHelper';
import * as NetworkInterface from '../../networkHelper/rest/networkInterface';

export function getAvailableRecognitionSlots() {
  const availableRecognitionTypes = {};
  availableRecognitionTypes[MyScriptJSConstants.RecognitionSlot.ON_PEN_UP] = true;
  availableRecognitionTypes[MyScriptJSConstants.RecognitionSlot.ON_DEMAND] = true;
  availableRecognitionTypes[MyScriptJSConstants.RecognitionSlot.ON_TIME_OUT] = true;
  return availableRecognitionTypes;
}

/**
 * Internal fonction to build the payload to ask for a recogntion.
 * @param paperOptions
 * @param model
 * @returns {{applicationKey: string}}
 * @private
 */
function buildInput(paperOptions, model) {
  const data = {
    applicationKey: paperOptions.recognitonParams.server.applicationKey,
    // "instanceId": null,
  };
  const textInput = {
    textParameter: null,
    inputUnits: [
      {
        textInputType: 'MULTI_LINE_TEXT',
        components: [/* Strokes */]
      }
    ]
  };

  //We recopy the text parameters
  textInput.textParameter = paperOptions.recognitonParams.textParameter;

  // As Rest Text recogntion is non incremental wa add the already recognized strokes
  model.recognizedStrokes.forEach((stroke) => {
    textInput.inputUnits[0].components.push(StrokeComponent.toJSON(stroke));
  });

  //We add the pending strokes to the model
  InkModel.extractNonRecognizedStrokes(model).forEach((stroke) => {
    textInput.inputUnits[0].components.push(StrokeComponent.toJSON(stroke));
  });

  data.textInput = JSON.stringify(textInput);
  if (paperOptions.recognitonParams.server.hmacKey) {
    data.hmac = CryptoHelper.computeHmac(data.textInput, paperOptions.recognitonParams.server.applicationKey, paperOptions.recognitonParams.server.hmacKey);
  }
  return data;
}


/**
 * Do the recogntion
 * @param paperOptionsParam
 * @param modelParam
 * @returns {Promise that return an updated model as a result}
 */
export function recognize(paperOptionsParam, modelParam) {
  const paperOptions = paperOptionsParam;
  const model = modelParam;

  const data = buildInput(paperOptions, modelParam);

  //FIXME manage http mode
  return NetworkInterface.post('https://' + paperOptions.recognitonParams.server.host + '/api/v3.0/recognition/rest/text/doSimpleRecognition.json', data)
      .then(
          (response) => {
            logger.debug('Cdkv3RestTextRecognizer success', response);
            return response;
          }
      ).then(
          (response) => {
            logger.debug('Cdkv3RestTextRecognizer update model', response);
            model.rawResult = response;
            return model;
          }
      );
}
