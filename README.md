# OES_texture_float_linear Polyfill

This is a polyfill for the WebGL extension OES_texture_float_linear. Try the [live demo](http://evanw.github.io/OES_texture_float_linear-polyfill/test.html) to see if the polyfill works for your browser.

OES_texture_float_linear was created to fix a mistake in the implementation of OES_texture_float. Although the spec for OES_texture_float requires that floating-point textures with linear filtering be marked as incomplete, the implementation of OES_texture_float in both Chrome and Firefox allowed linear filtering on floating-point textures. This caused apps that used linear filtering and floating-point textures to break on some mobile platforms that support floating-point textures but not linear filtering.

Upcoming browsers will prevent an app from using linear filtering on floating-point textures unless the app successfully acquires the OES_texture_float_linear extension. However, apps that check for OES_texture_float_linear support will then stop working on current browsers that don't know about OES_texture_float_linear. This polyfill checks if linear filtering works even though OES_texture_float_linear isn't supported.

# Usage

    <script src="OES_texture_float_linear-polyfill.js"></script>
    <script>
    var gl = document.createElement('canvas').getContext('experimental-webgl');
    document.write('OES_texture_float_linear: ' + !!gl.getExtension('OES_texture_float_linear'));
    </script>

# References

* [Chrome bug](https://code.google.com/p/chromium/issues/detail?id=238237)
* [Firefox bug](https://bugzilla.mozilla.org/show_bug.cgi?id=879954)
* [OES_texture_float_linear proposal](https://www.khronos.org/webgl/public-mailing-list/archives/1302/msg00042.html)
* [OES_texture_float_linear announcement](https://www.khronos.org/webgl/public-mailing-list/archives/1305/msg00022.html)
