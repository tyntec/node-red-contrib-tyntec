# node-red-contrib-tyntec

[Node-RED](http://nodered.org/) nodes for tyntec API.

## Features

- Send SMS

## Prerequisities

- Your own instance of [Node-RED](https://nodered.org/docs/getting-started/)
- Account for [tyntec](https://www.tyntec.com/)

## Installation

To install tyntec node to your Node-RED use this command:

```bash
  npm install node-red-contrib-tyntec
```

More detailed instructions in ["Adding nodes to the palette" in Node-RED documentation](https://nodered.org/docs/user-guide/runtime/adding-nodes).

## Usage

### Step 1: Create a new Node-RED flow

Create a new flow to add your new nodes into it.

![step 1](./docs/step-1.png)

### Step 2: Add and edit the "inject" node

Add an "inject" node.

![step 2-1](./docs/step-2-1.png)

Open the edit window of the "inject" node.

![step 2-2](./docs/step-2-2.png)

Set:

- `name` to `Fake temperature sensor`
- `msg.payload.room` to value `Livingroom`
- `msg.payload.temperature` to value `21`

Click to "Done" to save your changes.

### Step 3: Add and edit the "send-sms" node

Add a node called "send-sms" to your flow (you can find the node in a "function" section).

Connect your "Fake temperature sensor" node output to "send-sms" node input.

![step 3-1](./docs/step-3-1.png)

Edit your "send-sms" node.

Set:

- `name` to `Temperature SMS`
- add a new `Tyntec Configuration` with your tyntec API key
- (optional) `From` to your own name, which will appear as the sender's name
- add a new `To` configuration with your own name and phone number (Phone number has to be in [E.164](https://en.wikipedia.org/wiki/E.164) e.g. `+420123456789`)
- `Message` to 
  ```
  Hello from Node-RED.

  Your temperature in {{msg.payload.room}} is {{msg.payload.temperature}}ºC.

  Your lovely tyntec integration.
  ```
- (not recommended) uncheck the `Delivery check` (whether you need to confirm successful or unsuccessful SMS delivery)

![step 3-2](./docs/step-3-2.png)

### Step 4: Deploy and test your new flow

To deploy a flow, click the red "Deploy" button in the upper right corner.

![step 4-1](./docs/step-4-1.png)

Click on the square on the left side "Fake temperature sensor" to trigger the flow.

You should now see a blue dot labeled "accepted" when the SMS delivery has been triggered via the API.

![step 4-2](./docs/step-4-2.png)

If the SMS has not been delivered, the blue dot will change to red.

![step 4-3](./docs/step-4-3.png)

## Contributing