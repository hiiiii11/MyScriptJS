(function (scope) {

    /**
     * Arpeggiate input component
     * @constructor
     */
    function MusicArpeggiateInputComponent () {
        this.type = 'arpeggiate';
    }

    /**
     *
     * @type {MyScript.AbstractMusicInputComponent}
     */
    MusicArpeggiateInputComponent.prototype = new scope.AbstractMusicInputComponent();

    /**
     *
     * @type {MusicArpeggiateInputComponent}
     */
    MusicArpeggiateInputComponent.prototype.constructor = MusicArpeggiateInputComponent;

    /**
     * Get arpeggiate input component value
     * @returns {String}
     */
    MusicArpeggiateInputComponent.prototype.getValue = function () {
        return this.value;
    };

    /**
     * Set arpeggiate input component value
     * @param {String} value
     */
    MusicArpeggiateInputComponent.prototype.setValue = function (value) {
        this.value = value;
    };

    // Export
    scope.MusicArpeggiateInputComponent = MusicArpeggiateInputComponent;
})(MyScript);