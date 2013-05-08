/**
 * Tabs lets you create tabs for static and dynamic content.
 * @name Tabs
 * @class Tabs
 * @augments ch.Widget
 * @memberOf ch
 * @param {Object} [options] Object with configuration properties.
 * @param {Number} [options.shown] Show a child that will be open when component was loaded. By default, the value is 1.
 * @returns itself
 * @factorized
 * @exampleDescription Create a new Tab Navigator without configuration.
 * @example
 * var widget = $('.example').tabs();
 * @exampleDescription Create a new Tab Navigator with configuration.
 * @example
 * var widget = $('.example').tabs({
 *     'shown': 2
 * });
 * @see ch.Widget
 */
(function (window, $, ch) {
    'use strict';

    if (window.ch === undefined) {
        throw new window.Error('Expected ch namespace defined.');
    }

    function normalizeOptions(options) {

        var num = window.parseInt(options, 10);

        if (!window.isNaN(num)) {
            options = {
                'shown': num
            };
        }

        return options;
    }


    function Tabs($el, options) {

        this.init($el, options);

        /**
         * Reference to a internal component instance, saves all the information and configuration properties.
         * @private
         * @type {Object}
         */
        var that = this;

        /**
         * Triggers when the component is ready to use (Since 0.8.0).
         * @name ch.Tabs#ready
         * @event
         * @public
         * @since 0.8.0
         * @example
         * // Following the first example, using <code>widget</code> as Tabs's instance controller:
         * widget.on('ready',function () {
         *  this.show();
         * });
         */
        //This avoit to trigger execute after the component was instanciated
        window.setTimeout(function () { that.emit('ready'); }, 50);
    }


    /**
     * Inheritance
     */
    var parent = ch.util.inherits(Tabs, ch.Widget);

    /**
     * Prototype
     */
    Tabs.prototype.name = 'tabs';

    Tabs.prototype.constructor = Tabs;

    Tabs.prototype._defaults = {
        'shown': 1
    };

    Tabs.prototype.init = function ($el, options) {
        parent.init.call(this, $el, options);

        var that = this;

        /**
        * The actual location hash, is used to know if there's a specific tab shwown.
        * @private
        * @name ch.Tabs#hash
        * @type {String}
        */
        this._initialHash = window.location.hash.replace('#!/', '');

        /**
         * Children instances associated to this controller.
         * @public
         * @name ch.Form#children
         * @type {Array}
         */
        this._children = [];

        /**
         * The component's triggers container.
         * @protected
         * @name ch.Tabs#$triggers
         * @type {jQuery}
         */
        this.$triggers = this.$el.children(':first-child');

        /**
         * The component's container.
         * @protected
         * @name ch.Tabs#$container
         * @type {jQuery}
         */
        this.$container = this.$el.children(':last-child');

        /**
         * The tabpanel's containers.
         * @private
         * @name ch.Tabs#_$tabsContainers
         * @type {jQuery}
         */
        this._$tabsContainers = this.$container.children();

        /**
         * Default behavior
         */
        this.$el.addClass('ch-tabs');

        this.$triggers
            .addClass('ch-tabs-triggers')
            .attr('role', 'tablist');

        this.$container
            .addClass('ch-tabs-container ch-box-lite')
            .attr('role', 'presentation');

        // Creates children tab
        this.$triggers.find('a').each(function (i, e) {
            that._createTab(i, e);
        });

        this._shown = this._options.shown;

        this._hasHash();

        return this;
    };

    /**
     * Create controller's children.
     * @private
     * @name ch.Tabs#_createTabs
     * @function
     */
    Tabs.prototype._createTab = function (i, e) {
        var that = this,

            tab,

            $container = this._$tabsContainers.eq(i),

            // Create Tab's options
            options = {
                '_classNameTrigger': 'ch-tab',
                '_classNameContainer': 'ch-tabpanel ch-hide',
                'toggle': false
            };

        // Tab async configuration
        if ($container[0] === undefined) {

            $container = $('<div id="' + e.href.split('#')[1] + '">').appendTo(this.$container);

            options.content = e.href;
            options.waiting = this._options.waiting;
            options.cache = this._options.cache;
            options.method = this._options.method;
        }

        // Tab container configuration
        options.container = $container;

        // Creates new tab
        tab = new ch.Expandable($(e), options);

        // Creates tab's hash
        tab._hash = tab.el.href.split('#')[1];

        // Binds tap and focus events
        tab.$el
            .attr('role', 'tab')
            .on(ch.events.pointer.TAP + '.tabs focus.tabs', function () {
                that.show(i + 1);
            });

        tab.$container.attr('role', 'tabpanel');

        // Adds tabs to the collection
        this._children.push(tab);

        return this;
    };

    Tabs.prototype._hasHash = function () {
        var i = 0,
            // Shows the first tab if not hash or it's hash and it isn't from the current tab,
            len = this._children.length;
        // If hash open that tab
        for (i; i < len; i += 1) {
            if (this._children[i]._hash === this._initialHash) {
                this._shown = i + 1;
                break;
            }
        }

        this._children[this._shown - 1].show();

        /**
         * Fired when a tab is shown.
         * @name ch.Tabs#show
         * @event
         * @public
         */
        this.emit('show', this._shown);

        return this;
    };

    /**
     * Show a specific tab or get the shown tab.
     * @public
     * @name ch.Tabs#show
     * @function
     * @param {Number} [tab] Tab's index.
     * @exampleDescription Shows a specific tab
     * @example
     * widget.show(0);
     * @exampleDescription Returns the shown tab's index
     * @example
     * var shown = widget.show();
     */
    Tabs.prototype.show = function (index) {

        var shown = this._shown,

            // Sets the tab's index
            tab = this._children[index - 1];

        // If tab doesn't exist or if it's shown do nothing
        if (tab === undefined || shown === index) {
            return this;
        }

        // Hides the shown tab
        this._children[shown - 1].hide();

        // Shows the current tab
        tab.show();

        /**
         * Get wich tab is shown.
         * @private
         * @name ch.Tabs#_shown
         * @type {Number}
         */
        this._shown = index;

        // Update window location hash
        window.location.hash = '#!/' + tab._hash;

        /**
         * Fired when a tab is shown.
         * @name ch.Tabs#show
         * @event
         * @public
         */
        this.emit('show', this._shown);

        return this;
    };

    /**
     * Returns the number of current Tab.
     * @name getShown
     * @methodOf ch.Tabs#getShown
     * @returns {Number}
     * @exampleDescription
     * @example
     * if (widget.getShown() === 1) {
     *     fn();
     * }
     */
    Tabs.prototype.getShown = function () {
        return this._shown;
    };

    /**
     * Factory
     */
    ch.factory(Tabs, normalizeOptions);

}(this, this.ch.$, this.ch));