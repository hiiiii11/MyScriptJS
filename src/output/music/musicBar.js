(function (scope) {

    /**
     *
     * @param {Object} obj
     * @constructor
     */
    function MusicBar (obj) {
        scope.AbstractMusicElement.call(this, obj);
        this.decorations = [];
        if (obj) {
            this.repeatDirection = obj.repeatDirection;
            this.style = obj.style;
            for (var i in obj.decorations) {
                this.decorations.push(new scope.MusicDecoration(obj.decorations[i]));
            }
        }
    }

    /**
     *
     * @type {MyScript.AbstractMusicElement}
     */
    MusicBar.prototype = new scope.AbstractMusicElement();

    /**
     *
     * @type {MusicBar}
     */
    MusicBar.prototype.constructor = MusicBar;

    /**
     *
     * @returns {String}
     */
    MusicBar.prototype.getRepeatDirection = function () {
        return this.repeatDirection;
    };

    /**
     *
     * @returns {String}
     */
    MusicBar.prototype.getStyle = function () {
        return this.style;
    };

    /**
     *
     * @returns {Array}
     */
    MusicBar.prototype.getDecorations = function () {
        return this.decorations;
    };

    // Export
    scope.MusicBar = MusicBar;
})(MyScript);