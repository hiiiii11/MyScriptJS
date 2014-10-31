(function (scope) {

    /**
     * Head input component
     * @constructor
     */
    function MusicHeadInputComponent () {
        this.type = 'head';
    }

    /**
     *
     * @type {MyScript.AbstractMusicInputComponent}
     */
    MusicHeadInputComponent.prototype = new scope.AbstractMusicInputComponent();

    /**
     *
     * @type {MusicHeadInputComponent}
     */
    MusicHeadInputComponent.prototype.constructor = MusicHeadInputComponent;

    /**
     * Get head input component value
     * @returns {String}
     */
    MusicHeadInputComponent.prototype.getValue = function () {
        return this.value;
    };

    /**
     * Set head input component value
     * @param {String} value
     */
    MusicHeadInputComponent.prototype.setValue = function (value) {
        this.value = value;
    };

    // Export
    scope.MusicHeadInputComponent = MusicHeadInputComponent;
})(MyScript);