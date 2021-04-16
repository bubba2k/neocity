function main()
{
	initGL()

	const whiteShader = createProgram("res/shaders/v_simplepos.txt",
										"res/shaders/f_white.txt");

	const colorShader = createProgram("res/shaders/v_colored.txt",
										"res/shaders/f_colored.txt");
    var mesh = new Mesh();

    var vertices = new Float32Array([
		-0.5,  0.5,  0.5,
		 0.5,  0.5,  0.5,
		 0.5, -0.5,  0.5,
		-0.5, -0.5,  0.5,

		-0.5,  0.5, -0.5,
		 0.5,  0.5, -0.5,
		 0.5, -0.5, -0.5,
		-0.5, -0.5, -0.5
    ]);

    var indices = new Uint32Array([
		0, 1, 2, 0, 2, 3,	// front
		4, 5, 6, 4, 6, 7,	// back
		0, 4, 5, 0, 5, 1,	// top
		0, 3, 7, 0, 4, 7,	// left
		7, 3, 2, 7, 2, 6,	// bottom
		1, 5, 6, 1, 6, 2	// right
    ]);


    mesh.sendVertices(vertices);
    mesh.sendIndices(indices);

    var cube = new Thing(mesh);
	cube.shader = colorShader;

	cube.setScale(1);
	cube.setRotation(0, 0, 45);

	Camera.setPosition(0, 0, 2);

	var delay = 30;
	setInterval(function()
	{
		delta_t = delay / 1000;

		cube.setRotation(mousePos[1] * 0.4, mousePos[0] * 0.4, 0);

		Renderer.drawScene();
	}, delay);
}

function initGL()
{
	canvas = document.getElementById("glcanvas");

	if(!canvas)
	{
		throw "Element with ID \"glcanvas\" not found!";
	}

	gl = canvas.getContext('webgl2');
	if(!gl)
	{
		window.alert("Unable to get WebGL2 context!");
	}

	gl.enable(gl.DEPTH_TEST);
	gl.clearColor(0, 0, 0, 1);

	var body = document.body;

	body.addEventListener('mousemove',
		function(evt)
		{
			mousePos[0] = evt.clientX;
			mousePos[1] = evt.clientY;
		}, false);


	// Setup Camera
	Camera.aspectRatio = canvas.width / canvas.height;
	Camera.setOrientation(0, 1, 0);

	globalThings = [];
}

function compileShader(shaderPath, shaderType)
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

function createProgram(vertexShaderPath, fragmentShaderPath)
{
	vertexShader	= compileShader(vertexShaderPath, gl.VERTEX_SHADER);
	fragmentShader	= compileShader(fragmentShaderPath, gl.FRAGMENT_SHADER);

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

	destroy()
	{
		gl.deleteVertexArray(this.id);
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
		this.vertexBuffer = new Buffer("array");
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

	destroy()
	{
		this.vertexArray.destroy();
		this.vertexBuffer.destroy();
		this.indexBuffer.destroy();
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

class Thing
{
	constructor(argMesh = null)
	{
		this.mesh = argMesh;
		this.shader = null;

		this._modelMatrix = glMatrix.mat4.create();
		this._transformationHasChanged = true;

		this.rotationVector = glMatrix.vec3.create();
		this.translationVector = glMatrix.vec3.create();
		this.scaleVector = glMatrix.vec3.create();
			this.scaleVector[0] = 1.0;
			this.scaleVector[1] = 1.0;
			this.scaleVector[2] = 1.0;

		globalThings.push(this);
	}

	destroy()
	{
		for(var i = 0; i < globalThings.length; i++)
		{
			if(globalThings[i] === this)
			{
				globalThings[i].splice(i, 1);
			}
		}

		this.mesh = null;
	}

	modelMatrix()
	{
		if(this._transformationHasChanged)
		{
			var rotationQuaternion = glMatrix.quat.fromEuler(
				glMatrix.quat.create(), this.rotationVector[0],
				this.rotationVector[1], this.rotationVector[2]);

			this._modelMatrix = glMatrix.mat4.fromRotationTranslationScale(
									glMatrix.mat4.create(),
									rotationQuaternion,
									this.translationVector,
									this.scaleVector);

			this._transformationHasChanged = false;
		}

		return this._modelMatrix;
	}

	setRotation(x, y, z)
	{
		this.rotationVector[0] = x;
		this.rotationVector[1] = y;
		this.rotationVector[2] = z;

		this._transformationHasChanged = true;
	}

	setScale(x, y = null, z = null)
	{
		if( y == null )
		{
			this.scaleVector[0] = x;
			this.scaleVector[1] = x;
			this.scaleVector[2] = x;
		}
		else
		{
			this.scaleVector[0] = x;
			this.scaleVector[1] = y;
			this.scaleVector[2] = z;
		}

		this._transformationHasChanged = true;
	}

	setPosition(x, y, z = 0)
	{
		this.positionVector[0] = x;
		this.positionVector[1] = y;
		this.positionVector[2] = z;

		this._transformationHasChanged = true;
	}
}

class Renderer
{
	static drawScene()
	{
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		globalThings.forEach(function(thing)
		{
			thing.mesh.vertexArray.bind();
			gl.useProgram(thing.shader);

			// create and send mvp Matrix
			
			var mvpMatrix = glMatrix.mat4.create();						
			mvpMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(),
											Camera.projectionMatrix(),
											Camera.viewMatrix());

			mvpMatrix = glMatrix.mat4.multiply(glMatrix.mat4.create(),
											mvpMatrix,
											thing.modelMatrix());

			/* mvpMatrix = glMatrix.mat4.multiply(	glMatrix.mat4.create(),
							Camera.projectionMatrix(),
							thing.modelMatrix()); */

			var mvpLocation = gl.getUniformLocation(
									thing.shader, "u_mvpMatrix");
			gl.uniformMatrix4fv(mvpLocation, 
								gl.FALSE,
								Float32Array.from(mvpMatrix));

			gl.drawElements(gl.TRIANGLES, thing.mesh.count, 
							gl.UNSIGNED_INT, 0);
		});
	}
}

class Camera
{
	static _projectionMatrix = glMatrix.mat4.create();
	static _viewMatrix = glMatrix.mat4.create();

	static _projectionHasChanged = true;
	static _viewHasChanged = true;

	static positionVector = glMatrix.vec3.create();
	static targetVector   = glMatrix.vec3.create();
	static orientationVector = glMatrix.vec3.create();

	static aspectRatio;
	static fovy = 60.0 * (Math.PI / 180);

	static projectionMatrix()
	{
		if(this._projectionHasChanged)
		{
			this._projectionMatrix = glMatrix.mat4.perspective(
							glMatrix.mat4.create(),		// id matrix
							this.fovy,					// vertical fov in rad
							this.aspectRatio,		
							0.1,						// near clipping plane
							100.0);						// far clipping plane

			this._projectionHasChanged = false;
		}

		return this._projectionMatrix;
	}

	static viewMatrix()
	{
		if(this._viewHasChanged)
		{
			this._viewMatrix = glMatrix.mat4.lookAt(
							glMatrix.mat4.create(),
							this.positionVector,
							this.targetVector,
							this.orientationVector);

			this._viewHasChanged = false;
		}

		return this._viewMatrix;
	}

	static setPosition(x, y, z)
	{
		this.positionVector[0] = x;
		this.positionVector[1] = y;
		this.positionVector[2] = z;

		this._viewHasChanged = true;
		this._projectionHasChanged = true;
	}

	static setTarget(x, y, z)
	{
		this.targetVector[0] = x;
		this.targetVector[1] = y;
		this.targetVector[2] = z;

		this._viewHasChanged = true;
		this._projectionHasChanged = true;
	}

	static setOrientation(x, y, z)
	{
		this.orientationVector[0] = x;
		this.orientationVector[1] = y;
		this.orientationVector[2] = z;

		this._viewHasChanged = true;
		this._projectionHasChanged = true;
	}
}

var canvas;
var gl;
var globalThings;

var mousePos = glMatrix.vec2.create();

main();
