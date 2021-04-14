function main()
{
	var canvas = document.getElementById("glcanvas");
	var gl = canvas.getContext("webgl2");

	if(!gl)
	{
		window.alert("Unable to get WebGL context!");
	}

	gl.clearColor(0, 0, 0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);


	const shaderProgram = createProgram(gl, "res/shaders/v_simplepos.glsl",
											"res/shaders/f_white.glsl");

}

function compileShader(gl, shaderPath, shaderType)
{
	var request = xmlhttp = new XMLHttpRequest();
	request.open("GET", shaderPath, false);
	request.send();

	var shaderFile = request.responseText;

	var fileReader = new FileReader();
	var shaderSource = fileReader.readAsText(shaderFile);

  // Create the shader object
  var shader = gl.createShader(shaderType);
 
  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);
 
  // Compile the shader
  gl.compileShader(shader);
 
  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success)
	{
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + shaderPath + gl.getShaderInfoLog(shader);
  }
 
  return shader;
}

function createProgram(gl, vertexShaderPath, fragmentShaderPath)
{
	vertexShader	= compileShader(gl, vertexShaderPath, gl.VERTEX_SHADER);
	fragmentShader	= compileShader(gl, fragmentShaderPath, gl.FRAGMENT_SHADER);

  // create a program.
  var program = gl.createProgram();
 
  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
 
  // link the program.
  gl.linkProgram(program);
 
  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
      // something went wrong with the link
      throw ("program failed to link:" + gl.getProgramInfoLog (program));
  }
 
  return program;
};

class VertexArray
{
	constructor()
	{
		this.id = gl.createVertexArray();
	}

	bind()
	{
		gl.bindVertexArray(this.id);
	}

	unbind()
	{
		gl.bindVertexArray(0);
	}
}

class Buffer
{
	constructor(strTarget)
	{
		this.target = (strType == "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER);
		this.id = gl.createBuffer();
		this.valid = gl.isBuffer(this.id);
	}

	bind()
	{
		gl.bindBuffer(this.target, this.id);
	}

	setData(arraybuffer)
	{
		gl.BufferData(this.target, arraybuffer, gl.STATIC_DRAW);
	}

	unbind()
	{
		gl.bindbuffer(this.target, 0);
	}

	destroy()
	{
		gl.deleteBuffer(this.id);
		this.valid = false;
	}

	isValid()
	{
		return this.valid;
	}
}

class Mesh
{
	constructor()
	{
		this.vertexArray = new VertexArray();
		this.vertexBuffer = gl.createBuffer("array");
		this.indexBuffer  = gl.createBuffer("element");
		this.shader = 0;
		this.usesElementBuffer = false;
		this.count = 0;

		this.vertexArray.bind();

		this.indexBuffer.bind();

		this.vertexBuffer.bind();
		gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
		gl.enableVertexAttribArray(0);
	}

	sendVertices(arraybuffer)
	{
		this.vertexBuffer.setData(arraybuffer);
	}

	sendIndices(arraybuffer)
	{
		this.indexBuffer.setData(arraybuffer);
		this.usesElementBuffer = true;
	}
}

class Renderer
{
	drawMesh(mesh)
	{
		mesh.vertexArray.bind();
		gl.useProgram(mesh.shader);

		gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
	}
}

main();
