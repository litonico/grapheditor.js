var globalDragged,
    globalMousePos,
    globalNodes,
    globalHeight,
    globalWidth,
    globalCtx;

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((e.clientX-rect.left)/(rect.right-rect.left)*canvas.width),
    y: Math.floor((e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height),
  };
}

function drawRect(r) {
  // Canvas's built-in rect draws from top-right, we want from center
  var dx = r.w/2;
  var dy = r.h/2;
  globalCtx.strokeRect(r.x-dx, r.y-dy, r.w, r.h);
}

function evenlyDistribute(start, distance, thisNumber, totalNumber) {
  var offset = distance / (totalNumber+1);
  return(start + offset*thisNumber + offset);
}

function outputPosition(node, outputNumber) {
  var numberOfOutputs = node.outputs.length;
  var r = node.rect;
  var x = r.x + r.w/2; // Right side
  var top = r.y-r.h/2;
  var y = evenlyDistribute(top, r.w, outputNumber, numberOfOutputs);

  return({ x: x, y: y });
}

function inputPosition(node, inputNumber) {
  var numberOfInputs = node.inputs.length;
  var r = node.rect;
  var x = r.x - r.w/2; // Left side
  var top = r.y-r.h/2;
  var y = evenlyDistribute(top, r.w, inputNumber, numberOfInputs);

  return({ x: x, y: y });
}

function drawOutput(node, outputNumber) {
  var pos = outputPosition(node, outputNumber);
  drawRect({ x: pos.x, y: pos.y, w: 10, h: 10 });
}

function drawInput(node, inputNumber) {
  var pos = inputPosition(node, inputNumber);
  drawRect({ x: pos.x, y: pos.y, w: 10, h: 10 });
}

function drawConnection(fromNode, outputNumber, connectedTo) {
  // Connects an output to an input
  var outNode = fromNode;
  var inNode = globalNodes[connectedTo.nodeIndex];

  var outputPos = outputPosition(outNode, outputNumber);
  var inputPos = inputPosition(inNode, connectedTo.inputNumber);

  // Bezier start: middle of the output
  globalCtx.beginPath();
  globalCtx.moveTo(outputPos.x, outputPos.y);

  var midpointX = outputPos.x + (inputPos.x - outputPos.x)/2.0;

  globalCtx.bezierCurveTo(
    midpointX, outputPos.y,
    midpointX, inputPos.y,
    inputPos.x, inputPos.y // Bezier end: middle of the input
  );

  globalCtx.stroke();
}

function drawNode(node) {
  var i;

  drawRect(node.rect);

  for (i = 0; i < node.outputs.length; i++) {
    var output = node.outputs[i];
    drawOutput(node, i);

    if (output.connectedTo) {
      drawConnection(node, i, output.connectedTo);
    }
  }

  for (i = 0; i < node.inputs.length; i++) {
    drawInput(node, i);
  }
}

function clear() {
  globalCtx.clearRect(0, 0, globalWidth, globalHeight);
}

function update(nodes) {
  clear();
  var i;

  for (i = 0; i < nodes.length; i++) {
    var o = nodes[i];
    drawNode(o);
  }

  // TODO(lito): remove
  globalCtx.font = "12px Arial";
  globalCtx.fillText("Try dragging the boxes!", 135, 300);
}

function raycastFindNode(nodes) {
  // `find` just gets the first in the array. A more sophisticated impl
  // would have a depth ordering to pick the topmost.
  var found = nodes.find(function(node) {
    var rect = node.rect;
    return (
      globalMousePos.x > rect.x - rect.w/2 &&
      globalMousePos.x < rect.x + rect.w/2 &&
      globalMousePos.y > rect.y - rect.h/2 &&
      globalMousePos.y < rect.y + rect.h/2
    );
  });
  return found;
}

function onMouseDown() {
  globalDragged = raycastFindNode(globalNodes);
}

function onMouseUp() {
  globalDragged = undefined;
}

function dragNode(node) {
  // A real impl would drag the rectangle along with the mouse,
  // rather than snapping the center of the rect to the mouse
  node.rect.x = globalMousePos.x;
  node.rect.y = globalMousePos.y;
}

function main() {
  var canvas = document.getElementById("graph");
  globalCtx = canvas.getContext("2d");

  // Either recompute these or never resize your canvas
  globalWidth = canvas.width;
  globalHeight = canvas.height;

  var input0 = {
    name: "I am an input",
  };

  var input1 = {
    name: "I am an input",
  };

  var input2 = {
    name: "I am an input",
  };


  var output0 = {
    name: "I am an output",
    connectedTo: {
      nodeIndex: 1,
      inputNumber: 0
    },
  };

  var output1 = {
    name: "I am an output",
    connectedTo: {
      nodeIndex: 2,
      inputNumber: 0
    },
  };

  var output2 = {
    name: "I am an output",
    connectedTo: {
      nodeIndex: 1,
      inputNumber: 1
    },
  };


  var node0 = {
    rect: {
      y: 75,
      x: 75,
      w: 50,
      h: 50,
    },
    inputs: [],
    outputs: [output0, output1],
  };

  var node1 = {
    rect: {
      y: 100,
      x: 300,
      w: 50,
      h: 50,
    },
    inputs: [input1, input2],
    outputs: [],
  };

  var node2 = {
    rect: {
      y: 200,
      x: 200,
      w: 50,
      h: 50,
    },
    inputs: [input0],
    outputs: [output2],
  };

  // This should NOT be global, but... lazy
  globalNodes = [node0, node1, node2];

  globalDragged = undefined;

  canvas.addEventListener("mousemove", function(e) {
    globalMousePos = getMousePos(canvas, e);
    if (globalDragged !== undefined) {
      dragNode(globalDragged);
    }
    update(globalNodes);
  }, false);

  canvas.addEventListener("mousedown", onMouseDown, false);
  canvas.addEventListener("mouseup", onMouseUp, false);
}

main();
