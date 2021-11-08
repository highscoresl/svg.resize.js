/*!
* svg.resize.js - An extension for svg.js which allows to resize elements which are selected
* @version 2.0.0
* https://github.com/svgdotjs/svg.resize.js
*
* @copyright Ulrich-Matthias Schäfer
* @license MIT
*
* BUILT: Mon Nov 08 2021 22:45:30 GMT+0100 (hora estándar de Europa central)
*/;
this.SVG = this.SVG || {};
this.SVG.ResizeHandler = (function (svg_js) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var getCoordsFromEvent = function getCoordsFromEvent(ev) {
    if (ev.changedTouches) {
      ev = ev.changedTouches[0];
    }

    return {
      x: ev.clientX,
      y: ev.clientY
    };
  };

  var ResizeHandler = /*#__PURE__*/function () {
    function ResizeHandler(el) {
      _classCallCheck(this, ResizeHandler);

      this.el = el;
      this.lastCoordinates = null;
      this.eventType = '';
      this.handleResize = this.handleResize.bind(this);
      this.resize = this.resize.bind(this);
      this.endResize = this.endResize.bind(this);
      this.rotate = this.rotate.bind(this);
      this.shear = this.shear.bind(this);
    }

    _createClass(ResizeHandler, [{
      key: "active",
      value: function active(value) {
        // remove all resize events
        this.el.off('.resize');
        if (!value) return;
        this.el.on(['lt.resize', 'rt.resize', 'rb.resize', 'lb.resize', 't.resize', 'r.resize', 'b.resize', 'l.resize', 'rot.resize', 'shear.resize'], this.handleResize);
      } // This is called when a user clicks on one of the resize points

    }, {
      key: "handleResize",
      value: function handleResize(e) {
        this.eventType = e.type;
        var _e$detail = e.detail,
            startX = _e$detail.x,
            startY = _e$detail.y,
            event = _e$detail.event;
        var isMouse = !event.type.indexOf('mouse'); // Check for left button

        if (isMouse && (event.which || event.buttons) !== 1) {
          return;
        } // Fire beforedrag event


        if (this.el.dispatch('beforeresize', {
          event: e,
          handler: this
        }).defaultPrevented) {
          return;
        }

        this.box = this.el.bbox();
        this.startPoint = this.el.point(startX, startY); // We consider the resize done, when a touch is canceled, too

        var eventMove = (isMouse ? 'mousemove' : 'touchmove') + '.resize';
        var eventEnd = (isMouse ? 'mouseup' : 'touchcancel.resize touchend') + '.resize'; // Bind resize and end events to window

        if (e.type === 'rot') {
          svg_js.on(window, eventMove, this.rotate);
        } else if (e.type === 'shear') {
          svg_js.on(window, eventMove, this.shear);
        } else {
          // resize
          svg_js.on(window, eventMove, this.resize);
        }

        svg_js.on(window, eventEnd, this.endResize);
      }
    }, {
      key: "resize",
      value: function resize(e) {
        var endPoint = this.el.point(getCoordsFromEvent(e));
        var dx = endPoint.x - this.startPoint.x;
        var dy = endPoint.y - this.startPoint.y;
        var x = this.box.x + dx;
        var y = this.box.y + dy;
        var x2 = this.box.x2 + dx;
        var y2 = this.box.y2 + dy;
        var box = new svg_js.Box(this.box);

        if (this.eventType.includes('l')) {
          box.x = Math.min(x, this.box.x2);
          box.x2 = Math.max(x, this.box.x2);
        }

        if (this.eventType.includes('r')) {
          box.x = Math.min(x2, this.box.x);
          box.x2 = Math.max(x2, this.box.x);
        }

        if (this.eventType.includes('t')) {
          box.y = Math.min(y, this.box.y2);
          box.y2 = Math.max(y, this.box.y2);
        }

        if (this.eventType.includes('b')) {
          box.y = Math.min(y2, this.box.y);
          box.y2 = Math.max(y2, this.box.y);
        }

        box.width = box.x2 - box.x;
        box.height = box.y2 - box.y;

        if (this.el.dispatch('resize', {
          box: new svg_js.Box(box),
          angle: 0,
          shear: 0,
          eventType: this.eventType,
          event: e,
          handler: this
        }).defaultPrevented) {
          return;
        }

        this.el.move(box.x, box.y).size(box.width, box.height);
      }
    }, {
      key: "rotate",
      value: function rotate(e) {
        var endPoint = this.el.point(getCoordsFromEvent(e));
        var cx = this.box.cx;
        var cy = this.box.cy;
        var dx1 = this.startPoint.x - cx;
        var dy1 = this.startPoint.y - cy;
        var dx2 = endPoint.x - cx;
        var dy2 = endPoint.y - cy;
        var factor = 180 / Math.PI;
        var sAngle = Math.atan2(dx1, dy1);
        var pAngle = Math.atan2(dx2, dy2);
        var angle = sAngle - pAngle;

        if (this.el.dispatch('resize', {
          box: this.startBox,
          angle: angle,
          shear: 0,
          eventType: this.eventType,
          event: e,
          handler: this
        }).defaultPrevented) {
          return;
        }

        this.el.rotate(angle * factor);
      }
    }, {
      key: "shear",
      value: function shear(e) {
        var endPoint = this.el.point(getCoordsFromEvent(e));
        var cx = this.box.cx;
        var cy = this.box.cy;
        var dx1 = this.startPoint.x - cx;
        var dy1 = this.startPoint.y - cy;
        var dx2 = endPoint.x - cx;
        var factor = 180 / Math.PI;
        var sAngle = Math.atan2(dx1, dy1);
        var pAngle = Math.atan2(dx2, dy1);
        var angle = pAngle - sAngle;

        if (this.el.dispatch('resize', {
          box: this.startBox,
          angle: 0,
          shear: angle,
          eventType: this.eventType,
          event: e,
          handler: this
        }).defaultPrevented) {
          return;
        }

        this.el.skew(factor * angle, 0);
      }
    }, {
      key: "endResize",
      value: function endResize(ev) {
        // Unbind resize and end events to window
        if (this.eventType !== 'rot' && this.eventType !== 'shear') {
          this.resize(ev);
        }

        this.eventType = '';
        svg_js.off(window, 'mousemove.resize touchmove.resize');
        svg_js.off(window, 'mouseup.resize touchend.resize');
      }
    }, {
      key: "snapToGrid",
      value: function snapToGrid(box, xGrid) {// TODO: Snap helper function
      }
    }]);

    return ResizeHandler;
  }();

  svg_js.extend(svg_js.Element, {
    // Resize element with mouse
    resize: function resize() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var resizeHandler = this.remember('_resizeHandler');

      if (!resizeHandler) {
        if (enabled.prototype instanceof ResizeHandler) {
          /* eslint new-cap: ["error", { "newIsCap": false }] */
          resizeHandler = new enabled(this);
          enabled = true;
        } else {
          resizeHandler = new ResizeHandler(this);
        }

        this.remember('_resizeHandler', resizeHandler);
      }

      resizeHandler.active(enabled);
      return this;
    }
  });

  return ResizeHandler;

}(SVG));
//# sourceMappingURL=svg.resize.js.map
