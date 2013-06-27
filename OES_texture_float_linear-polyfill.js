if (window.WebGLRenderingContext) {
  WebGLRenderingContext.prototype.getExtension = function(oldGetExtension) {

    // The constructor for the returned extension object
    function OESTextureFloatLinear() {
    }

    // Note: This tries to avoid changing global state by saving and restoring it
    // but this will change the current binding for vertex attribute array 0
    // because there is no way to save and restore the vertex attribute state
    function supportsOESTextureFloatLinear(gl) {
      // Need floating point textures in the first place
      if (!oldGetExtension.call(gl, 'OES_texture_float')) {
        return false;
      }

      // Save state
      var oldActiveTexture = gl.getParameter(gl.ACTIVE_TEXTURE);
      gl.activeTexture(gl.TEXTURE0);
      var oldTexture0 = gl.getParameter(gl.TEXTURE_BINDING_2D);
      var oldFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      var oldViewport = gl.getParameter(gl.VIEWPORT);
      var oldArrayBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
      var oldProgram = gl.getParameter(gl.CURRENT_PROGRAM);

      // Create a render target
      var framebuffer = gl.createFramebuffer();
      var byteTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, byteTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, byteTexture, 0);

      // Create a simple floating-point texture with value of 0.5 in the center
      var rgba = [
        2, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
      ];
      var floatTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, floatTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.FLOAT, new Float32Array(rgba));

      // Create the test shader
      var program = gl.createProgram();
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertexShader, '\
        attribute vec2 vertex;\
        void main() {\
          gl_Position = vec4(vertex, 0.0, 1.0);\
        }\
      ');
      gl.shaderSource(fragmentShader, '\
        uniform sampler2D texture;\
        void main() {\
          gl_FragColor = texture2D(texture, vec2(0.5));\
        }\
      ');
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      // Create a buffer containing a single point
      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STREAM_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      // Render the point and read back the rendered pixel
      var pixel = new Uint8Array(4);
      gl.useProgram(program);
      gl.viewport(0, 0, 1, 1);
      gl.bindTexture(gl.TEXTURE_2D, floatTexture);
      gl.drawArrays(gl.POINTS, 0, 1);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

      // Clean up
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteTexture(floatTexture);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteTexture(byteTexture);

      // Restore state
      gl.useProgram(oldProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, oldArrayBuffer);
      gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);
      gl.bindFramebuffer(gl.FRAMEBUFFER, oldFramebuffer);
      gl.bindTexture(gl.TEXTURE_2D, oldTexture0);
      gl.activeTexture(oldActiveTexture);

      // The center sample will only have a value of (2 + 0 + 0 + 0) / 4 = 0.5
      // if linear sampling works with floating-point textures
      return pixel[0] === 127 || pixel[0] === 128;
    }

    // Cache the extension so it's specific to each context like extensions should be
    function getOESTextureFloatLinear(gl) {
      if (gl.$OES_texture_float_linear$ === void 0) {
        Object.defineProperty(gl, '$OES_texture_float_linear$', {
          enumerable: false,
          configurable: false,
          writable: false,
          value: supportsOESTextureFloatLinear(gl) ? new OESTextureFloatLinear() : null
        });
      }
      return gl.$OES_texture_float_linear$;
    }

    // Intercept OES_texture_float_linear if the browser doesn't provide it
    function getExtension(name) {
      var extension = oldGetExtension.call(this, name);
      if (extension === null && name === 'OES_texture_float_linear') {
        extension = getOESTextureFloatLinear(this);
      }
      return extension;
    }

    return getExtension;

  }(WebGLRenderingContext.prototype.getExtension);
}
