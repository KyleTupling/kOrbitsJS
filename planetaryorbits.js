const canvas = document.getElementById("appCanvas");
const ctx = canvas.getContext("2d");

const G = 6.67e-11

var keys = {
    W: false,
    A: false,
    S: false,
    D: false
};

class Vector2D
{
    constructor(_x, _y)
    {
        this.x = _x || 0;
        this.y = _y || 0;
    }

    // ---------- Static arithmetic functions ----------

    /**
     * Adds two vectors.
     * @param {Vector2D} _vector1 The first vector.
     * @param {Vector2D} _vector2 The second vector.
     * @return {Vector2D} The resultant vector.
    */
    static Add(_vector1, _vector2)
    {
        return new Vector2D(_vector1.x + _vector2.x, _vector1.y + _vector2.y);
    }

    /**
     * Subtracts one vector from another.
     * @param {Vector2D} _vector1 The first vector.
     * @param {Vector2D} _vector2 The vector to be subtracted from the first vector.
     * @return {Vector2D} The resultant vector.
    */
    static Subtract(_vector1, _vector2)
    {
        return new Vector2D(_vector1.x - _vector2.x, _vector1.y - _vector2.y);
    }

    /**
     * Multiplies a vector by a scalar.
     * @param {Vector2D} _vector1 The vector.
     * @param {float} _scalar The scalar to multiply the vector by.
     * @return {Vector2D} The resultant vector.
    */
    static Multiply(_vector, _scalar)
    {
        return new Vector2D(_vector.x * _scalar, _vector.y * _scalar);
    }

    /**
     * Divides a vector by a scalar.
     * @param {Vector2D} _vector1 The vector.
     * @param {float} _scalar The scalar to divide the vector by.
     * @return {Vector2D} The resultant vector.
    */
    static Divide(_vector, _scalar)
    {
        return new Vector2D(_vector.x / _scalar, _vector.y / _scalar);
    }

    // ---------- Vector property functions -----------

    /**
     * Gets the magnitude of a vector instance.
     * @return {float} The magnitude of the vector.
    */
    GetMagnitude()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Gets the squared magnitude of a vector instance. More performant than GetMagnitude().
     * @return {float} The squared magnitude of the vector.
    */
    GetMagnitudeSqr()
    {
        return (this.x * this.x + this.y * this.y);
    }
}

class Camera
{
    constructor(_pos, _zoom)
    {
        this.position = _pos;
        this.zoom = _zoom;
    }

    /**
     * Converts coordinates in world space to screen space.
     * @param {Vector2D} _worldPos The world position vector.
     * @return {Vector2D} The resultant screen position vector.
    */
    ConvertWorldToScreen(_worldPos)
    {
        return new Vector2D(
            (_worldPos.x - this.position.x) * this.zoom + SCREENSIZE.x / 2,
            (_worldPos.y - this.position.y) * this.zoom + SCREENSIZE.y / 2
        );
    }

    /**
     * Converts coordinates in screen space to world space.
     * @param {Vector2D} _screenPos The screen position vector.
     * @return {Vector2D} The resultant world position vector.
    */
    ConvertScreenToWorld(_screenPos)
    {
        return new Vector2D(
            (_screenPos.x - SCREENSIZE.x / 2) / this.zoom + this.position.x,
            (_screenPos.y - SCREENSIZE.y / 2) / this.zoom + this.position.y
        );
    }
}

class Body
{
    constructor(_position, _velocity)
    {
        this.position = _position;
        this.velocity = _velocity;
        this.acceleration = new Vector2D(0, 0);

        this.mass = 10;
        this.radius = 10;

        this.name = "Body";
        this.drawName = true;

        this.colour = "#FF0000";
    }

    /**
     * Applies a force to the body according to Newton's 2nd Law.
     * @param {Vector2D} _force The force vector.
    */
    ApplyForce(_force)
    {
        let forceAcceleration = Vector2D.Divide(_force, this.mass);
        this.acceleration = Vector2D.Add(this.acceleration, forceAcceleration);
    }

    /**
     * Applies an attraction force from this body to another body according to Newton's Law of Gravitation.
     * @param {Body} _body The body to attract.
    */
    AttractBody(_body)
    {
        let direction = Vector2D.Subtract(this.position, _body.position);
        let dirMagnitude = direction.GetMagnitude();
        if(dirMagnitude != 0)
        {
            let dirUnit = Vector2D.Divide(direction, dirMagnitude);
            let forceMagnitude = (G * this.mass * _body.mass) / (dirMagnitude * dirMagnitude);
            let force = Vector2D.Multiply(dirUnit, forceMagnitude);
            _body.ApplyForce(force);
        }
    }

    Draw(_ctx, _camera)
    {
        let screenPos = _camera.ConvertWorldToScreen(this.position);

        _ctx.fillStyle = this.colour;       
        _ctx.fillRect(
            screenPos.x - this.radius * _camera.zoom,
            screenPos.y - this.radius * _camera.zoom,
            this.radius * 2 * _camera.zoom,
            this.radius * 2 * _camera.zoom
        );

        // Draw body name if drawName is enabled
        if(this.drawName)
        {
            _ctx.font = "20px Arial";
            _ctx.textAlign = "center";
            _ctx.fillText(this.name, screenPos.x, screenPos.y + this.radius + 20 * _camera.zoom);
        }
    }

    Update()
    {
        this.velocity = Vector2D.Add(this.velocity, this.acceleration);
        this.position = Vector2D.Add(this.position, this.velocity);
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }
}

// Set canvas size
const SCREENSIZE = new Vector2D(800, 800);
canvas.width = SCREENSIZE.x;
canvas.height = SCREENSIZE.y;

// Create main camera at origin with zoom 1
var mainCamera = new Camera(new Vector2D(0, 0), 1);

var body1 = new Body(new Vector2D(-50, -150), new Vector2D(1.5, 0));

var body2 = new Body(new Vector2D(0, 0), new Vector2D(0, 0));
body2.mass = 1e13;
body2.name = "Star";
body2.colour = "#FFAA00";

// Track key states
window.addEventListener("keydown", event => {
    switch (event.code)
    {
        case "KeyW":
            keys.W = true;
            break;
        case "KeyA":
            keys.A = true;
            break;
        case "KeyS":
            keys.S = true;
            break;
        case "KeyD":
            keys.D = true;
            break;
    }
});

window.addEventListener("keyup", event => {
    switch (event.code)
    {
        case "KeyW":
            keys.W = false;
            break;
        case "KeyA":
            keys.A = false;
            break;
        case "KeyS":
            keys.S = false;
            break;
        case "KeyD":
            keys.D = false;
            break;
    }
});

// Listen for scrolls to zoom camera
window.addEventListener("wheel", event => {
    // TODO: Add zoom system to camera class
    mainCamera.zoom -= event.deltaY * 0.01;
    // Clamp camera zoom
    mainCamera.zoom = Math.max(0.5, Math.min(mainCamera.zoom, 5));
});

function Update()
{
    // Clear render screen
    ctx.clearRect(0, 0, SCREENSIZE.x, SCREENSIZE.y);

    // Check for camera movement
    if(keys.W)
    {
        mainCamera.position.y -= 1;
    }
    if(keys.A)
    {
        mainCamera.position.x -= 1;
    }
    if(keys.S)
    {
        mainCamera.position.y += 1;
    }
    if(keys.D)
    {
        mainCamera.position.x += 1;
    }

    body2.AttractBody(body1);

    body1.Update();

    // Draw bodies
    body1.Draw(ctx, mainCamera);
    body2.Draw(ctx, mainCamera);
    
    requestAnimationFrame(Update);
}

Update();