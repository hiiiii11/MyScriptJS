(function (scope) {

    /**
     * The Stroker class that can use to store writing strokes and manage the undo/redo/clear system
     *
     * @class Stroker
     * @constructor
     */
    function Stroker () {
        this.writing = false;
        this.strokes = [];
        this.currentStroke = null;
        this.undoRedoStack = [];
    }

    /**
     * Is Wrinting a stoke
     *
     * @method isWriting
     * @returns {Boolean}
     */
    Stroker.prototype.isWriting = function () {
        return this.writing;
    };

    /**
     * Get the last current Stroke write
     *
     * @method getCurrentStroke
     * @returns {Stroke}
     */
    Stroker.prototype.getCurrentStroke = function () {
        return this.currentStroke;
    };

    /**
     * Start to write a stroke
     *
     * @method startStrokeWriting
     * @param {Number} x abcisse coordinate
     * @param {Number} y ordinate coordinate
     */
    Stroker.prototype.startStrokeWriting = function (x, y) {
        this.currentStroke = new scope.Stroke();
        this.currentStroke.addX(x);
        this.currentStroke.addY(y);
        this.writing = true;
    };

    /**
     * Continue to write a stroke
     *
     * @method continueStrokeWriting
     * @param {Number} x abcisse coordinate
     * @param {Number} y ordinate coordinate
     */
    Stroker.prototype.continueStrokeWriting = function (x, y) {
        if (this.writing) {
            this.currentStroke.addX(x);
            this.currentStroke.addY(y);
        }
    };

    /**
     * End of writing a stroke
     *
     * @method endStrokeWriting
     * @param {Object} event
     */
    Stroker.prototype.endStrokeWriting = function (event) {
        this.strokes.push(this.currentStroke);
        this.writing = false;
        event.preventDefault();
    };

    /**
     * Clear the strokes list
     *
     * @method clear
     */
    Stroker.prototype.clear = function () {
        this.writing = false;
        this.strokes = [];
        this.currentStroke = null;
        this.undoRedoStack = [];
    };

    /**
     * Is The Strokes list is empty
     *
     * @method isEmpty
     * @returns {Boolean}
     */
    Stroker.prototype.isEmpty = function () {
        return this.strokes.length === 0;
    };

    /**
     * Is the Undo/Redo Stack empty
     *
     * @method isRedoEmpty
     * @returns {Boolean}
     */
    Stroker.prototype.isRedoEmpty = function () {
        return this.undoRedoStack.length === 0;
    };

    /**
     * Make an undo
     *
     * @method undo
     */
    Stroker.prototype.undo = function () {
        this.undoRedoStack.push(this.strokes[this.strokes.length - 1]);
        this.strokes.pop();
    };

    /**
     * Make a redo
     *
     * @method redo
     */
    Stroker.prototype.redo = function () {
        this.strokes.push(this.undoRedoStack[this.undoRedoStack.length - 1]);
        this.undoRedoStack.pop();
    };

    /**
     * Get the strokes list
     *
     * @method getStokes
     * @returns {Stroke[]}
     */
    Stroker.prototype.getStrokes = function () {
        return this.strokes;
    };

    /**
     * Get the Undo/Redo Stack
     *
     * @method getUndoRedoStack
     * @returns {Stroke[]}
     */
    Stroker.prototype.getUndoRedoStack = function () {
        return this.undoRedoStack;
    };

    /**
     * Clear the Undo/Redo Stack
     *
     * @method clearUndoRedoStack
     */
    Stroker.prototype.clearUndoRedoStack = function () {
        this.undoRedoStack = [];
    };

    /**
     * Copy the strokes values from index on an other list of strokes
     *
     * @method copy
     * @param {Stroke[]} strokes List of strokes
     * @param {Number} index Position to start the copy
     */
    Stroker.prototype.copy = function (strokes, index) {
        for (index; index < this.strokes.length; index++) {
            strokes.push(this.strokes[index]);
        }
    };

    // Export
    scope.Stroker = Stroker;
})(MyScript);