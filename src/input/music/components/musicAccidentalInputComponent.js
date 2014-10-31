(function (scope) {

    /**
     * Accidental input component
     * @constructor
     */
    function MusicAccidentalInputComponent () {
        this.type = 'accidental';
    }

    /**
     *
     * @type {MyScript.AbstractMusicInputComponent}
     */
    MusicAccidentalInputComponent.prototype = new scope.AbstractMusicInputComponent();

    /**
     *
     * @type {MusicAccidentalInputComponent}
     */
    MusicAccidentalInputComponent.prototype.constructor = MusicAccidentalInputComponent;

    /**
     * Get accidental input component value
     * @returns {String}
     */
    MusicAccidentalInputComponent.prototype.getValue = function () {
        return this.value;
    };

    /**
     * Set accidental input component value
     * @param {String} value
     */
    MusicAccidentalInputComponent.prototype.setValue = function (value) {
        this.value = value;
    };

    // Export
    scope.MusicAccidentalInputComponent = MusicAccidentalInputComponent;
})(MyScript);