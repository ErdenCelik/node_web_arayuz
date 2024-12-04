const systemDefaultSettings = [
    { key: 'allowedClasses', value: null, type: 'json', description: 'İzin verilen nesne sınıfları' },
    { key: 'confidenceThreshold', value: '0.5', type: 'float', description: 'Nesne tespiti için güvenilirlik eşiği' },
    { key: 'frameHeight', value: '480', type: 'int', description: 'Kameradan alınacak görüntü yüksekliği' },
    { key: 'frameWidth', value: '640', type: 'int', description: 'Kameradan alınacak görüntü genişliği' },
    { key: 'fpsLimit', value: '30', type: 'int', description: 'Fps limit' },
    { key: 'minAreaDifference', value: '0.2', type: 'float', description: 'Alan farkı eşiği' },
    { key: 'densityThreshold', value: '0.8', type: 'float', description: 'Yoğunluk eşiği' },
    { key: 'minIou', value: '0.5', type: 'float', description: 'Minimum kesişme eşiği' },
    { key: 'minSaveInterval', value: '2.0', type: 'float', description: 'Minimum kaydetme aralığı' },
    { key: 'skipFrames', value: '5', type: 'int', description: 'Her kaç karede bir tespit yapılacağı' },
    { key: 'pyHost', value: 'localhost', type: 'string', description: 'Python host' },
    { key: 'wsPort', value: '3010', type: 'int', description: 'Websocket port' },
    { key: 'apiPort' , value: '5000', type: 'int', description: 'API port' },
];

const systemTypes = {
    json: 'json',
    int: 'int',
    float: 'float',
    string: 'string',
    boolean: 'boolean'
};

const SettingKeys = {
    allowedClasses: 'allowedClasses',
    confidenceThreshold: 'confidenceThreshold',
    frameHeight: 'frameHeight',
    frameWidth: 'frameWidth',
    minAreaDifference: 'minAreaDifference',
    minDetectionDifference: 'minDetectionDifference',
    minIou: 'minIou',
    minSaveInterval: 'minSaveInterval',
    skipFrames: 'skipFrames',
    pyHost: 'pyHost',
    wsPort: 'wsPort',
    apiPort: 'apiPort',
};
module.exports = {
    systemDefaultSettings,
    systemTypes,
    SettingKeys
};