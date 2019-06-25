/*!
 *	TypeWatch 3
 *
 *	Examples/Docs: github.com/dennyferra/TypeWatch
 *
 *  Dual licensed under the MIT and GPL licenses:
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 */
!function(e,t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof exports?t(require("jquery")):t(e.jQuery)}(this,function(e){"use strict";e.fn.typeWatch=function(t){var n=e.extend({wait:750,callback:function(){},highlight:!0,captureLength:2,allowSubmit:!1,inputTypes:["TEXT","TEXTAREA","PASSWORD","TEL","SEARCH","URL","EMAIL","DATETIME","DATE","MONTH","WEEK","TIME","DATETIME-LOCAL","NUMBER","RANGE","DIV"]},t);function i(e){var t=(e.type||e.nodeName).toUpperCase();if(jQuery.inArray(t,n.inputTypes)>=0){var i={timer:null,text:"DIV"===t?jQuery(e).html():jQuery(e).val(),cb:n.callback,el:e,type:t,wait:n.wait};n.highlight&&"DIV"!==t&&jQuery(e).focus(function(){this.select()});jQuery(e).on("keydown paste cut input",function(e){var u=i.wait,r=!1,c=t;void 0!==e.keyCode&&13==e.keyCode&&"TEXTAREA"!==c&&"DIV"!==t&&(console.log("OVERRIDE"),u=1,r=!0);clearTimeout(i.timer),i.timer=setTimeout(function(){!function(e,t){var i="DIV"===e.type?jQuery(e.el).html():jQuery(e.el).val();(i.length>=n.captureLength&&i!=e.text||t&&(i.length>=n.captureLength||n.allowSubmit)||0==i.length&&e.text)&&(e.text=i,e.cb.call(e.el,i))}(i,r)},u)})}}return this.each(function(){i(this)})}});