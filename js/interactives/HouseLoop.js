define(['jquery', 'dom/Stage'], function($, Stage) {
  var answers = [true, false, true, true, false];
  var siding = ['#CFC', '#FCC', '#CCF', '#FFC', '#FCF'];
  var houses = [];

  var stage = new Stage('.interactive.houses canvas');
  var assistant = new stage.Sprite();
  assistant.draw = function() {
    var ctx = this.context;
    ctx.arc(0, 0, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-4, 14);
    ctx.moveTo(0, 10);
    ctx.lineTo(4, 14);
    ctx.moveTo(-5, 6);
    ctx.lineTo(5, 6);
    //ctx.fill();
    ctx.stroke();
  };
  assistant.x = 20;
  assistant.y = 20;

  var House = function(color, label) {
    stage.Sprite.call(this);
    this.color = color || '#888';
    if (label) {
      var l = new stage.TextBox();
      l.text = label;
      l.align = 'center';
      l.width = 40;
      l.size = 13;
      l.x = -18;
      l.y = -13;
      this.addChild(l);
    }
  }
  House.prototype = new stage.Sprite();
  House.prototype.draw = function() {
    var ctx = this.context;
    ctx.moveTo(-20, 0);
    ctx.lineTo(-20, 20);
    ctx.lineTo(20, 20);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, -20);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();
  }

  for (var i = 0; i < answers.length; i++) {
    var house = new House(siding[i], '#' + i + ': ' + answers[i].toString());
    stage.addChild(house);
    house.x = i * 60 + 80;
    house.y = 20;
    houses.push(house);
  }
  
  stage.addChild(assistant);

  stage.render();

  var at = 0;
  var i = undefined;
  var counter = undefined;

  var steps = [
    {highlight:"array", description:"We'll start by declaring an array named <var>houses</var>, containing the answers to the quiz questions.", counter: 0, i: 0, assistant: {x: 20, y: 20}},
    {highlight:"counter", description:"We also create a <var>counter</var> variable, to keep track of how many houses answer <var>true</var>.", counter: 0,},
    {highlight:"setup", description:"Now we enter our loop. The first thing to run is the setup, where we declare a variable <var>i</var> and set it equal to 0. This will be used to keep track of which house's answer we're currently examining.", i: 0},
    {highlight:"condition", description:"<var>i</var> is currently zero, which is less than <var>houses.length</var> (5), so we'll enter the loop.", assistant: {x: 20, y: 20}},
    {highlight:"current", description:"We'll make a variable named <var>current</var> to keep track of the current house (visually represented by our little assistant stick person). We find that house by looking up the answer at <var>houses[i]</var>. <var>i</var> is currently 0, so we're looking at the first house (<var>houses[0]</var>).", assistant: {x:houses[0].x, y:houses[0].y + 30}, counter: 0},
    {highlight:"if", description:"If the current house's answer is true, we'll want to keep track of that. In this case, it is, so..."},
    {highlight:"increment", description:"...we'll add one to our counter variable and save the increased value.", counter: 1, i: 0},
    {highlight:"change", description:"Now we've reached the end of the loop, so the <b>change</b> part of our loop happens. In this case, we move on to the next house by adding 1 to <var>i</var>.", i: 1},
    {highlight:"condition", description:"Should we run this loop again? Let's check the condition. After the change, <var>i</var> is now equal to 1, which is still less than <var>houses.length</var>, so yes, we'll keep going through the loop.", assistant: {x:houses[0].x, y:houses[0].y + 30}},
    {highlight:"current", description:"Once again, we get the current house by using <var>i</var> to pull an item out of our <var>houses</var> array. This time, the answer is <var>false</var>", assistant: {x:houses[1].x, y:houses[1].y + 30}, i: 1},
    {highlight:"if", description:"Since the current answer is false, we won't add one to <var>counter</var>, and we'll end this run through the loop."},
    {highlight:"change", description:"Update <var>i</var> by adding one to it.", i: 2},
    {highlight:"condition", description:"Since <var>i</var> is still less than <var>houses.length</var>, execute the loop block again.", assistant: {x:houses[1].x, y:houses[1].y + 30}},
    {highlight:"current", description:"Set <var>current</var> to the value at <var>houses[i]</var>, which is true. (Remember, <var>i</var> is currently 2, so we're at the third house.", assistant:{x:houses[2].x, y:houses[2].y + 30}},
    {highlight:"if", description:"Since <var>current</var> is true...", counter: 1},
    {highlight:"increment", description:"...increase the value of <var>counter</var> by one.", counter: 2},
    {highlight:"condition", description:"Let's skip ahead a few steps: at some point, <var>i</var> (which keeps track of where we are in the <var>houses</var> array) is going to be the same as <var>houses.length</var>. At that point, we've run out items (remember, the last item is at the index <var>length - 1</var>). More importantly, this condition will be false. At that point, instead of running the loop again, we continue with the rest of the script.", assistant: {x: houses[4].x + 40, y: 20}, i: 5, counter: 3},
    {highlight:"finished", description:"Now, let's print the result to the console. All done!"}
  ];

  var onStep = function(e) {
    var id = e ? this.id : "reset";
    switch (id) {
      case "previous": at = at > 0 ? at - 1 : at; break;
      case "next": at = at < steps.length - 1 ? at + 1 : at; break;
      case "reset": at = 0;
    }
    var step = steps[at];
    $('.last').removeClass('last');
    $('.highlight').removeClass('highlight').addClass('last');
    $('.' + step.highlight).addClass('highlight');
    if (typeof step.i != 'undefined') i = step.i;
    if (typeof step.counter != 'undefined') counter = step.counter;
    $('.description').html(step.description + "<ul><li>i = " + i + "<li>counter = " + counter + "</ul>");
    if (step.assistant) {
      assistant.x = step.assistant.x;
      assistant.y = step.assistant.y;
    }
    stage.render();
  }

  $('#previous, #next, #reset').on('click', onStep);
  onStep();

});