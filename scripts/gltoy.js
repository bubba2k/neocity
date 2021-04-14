var canvas = document.getElementById("glcanvas");
var gl = canvas.getContext("webgl2");

function main()
{

	if(!gl)
	{
		window.alert("Unable to get WebGL context!");
	}



	const shaderProgram = createProgram(gl, "res/shaders/v_simplepos.txt",
											"res/shaders/f_white.txt");
    var mesh = new Mesh();

    gl.clear(gl.COLOR_BUFFER_BIT);

    var vertices = new Float32Array([
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
         0.0, -1.0,  0.0
    ]);

    var indices = new Uint32Array([
        0, 1, 2
    ]);


    mesh.sendVertices(vertices);
    mesh.sendIndices(indices);

    mesh.shader = shaderProgram;
        
    Renderer.drawMesh(mesh);
}

function compileShader(gl, shaderPath, shaderType)
{
	var request = xmlhttp = new XMLHttpRequest();
	request.open("GET", shaderPath, false);
	request.send();

	var shaderSource = request.responseText;

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
		gl.bindVertexArray(null);
	}
}

class Buffer
{
	constructor(strTarget)
	{
		this.target = (strTarget == "array" ? gl.ARRAY_BUFFER : gl.ELEMENT_ARRAY_BUFFER);
		this.id = gl.createBuffer();
		this.valid = gl.isBuffer(this.id);
	}

	bind()
	{
		gl.bindBuffer(this.target, this.id);
	}

	setData(arraybuffer)
	{
        this.bind();
		gl.bufferData(this.target, arraybuffer, gl.STATIC_DRAW);
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
		this.vertexArray  = new VertexArray();
		this.vertexBuffer = new Buffer("vertex");
		this.indexBuffer  = new Buffer("element");
        this.shader = 0;
		this.usesElementBuffer = false;
		this.count = 0;

		this.vertexArray.bind();

		this.indexBuffer.bind();

		this.vertexBuffer.bind();
		gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
		gl.enableVertexAttribArray(0);

        this.vertexArray.unbind();
	}

	sendVertices(arraybuffer)
	{
		this.vertexBuffer.setData(arraybuffer);
	}

	sendIndices(arraybuffer)
	{
		this.indexBuffer.setData(arraybuffer);
        this.count = arraybuffer.length;
	}
}

class Renderer
{
	static drawMesh(mesh)
	{
		mesh.vertexArray.bind();
		gl.useProgram(mesh.shader);

		gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0);
	}
}

main();
