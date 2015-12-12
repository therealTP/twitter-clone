//---DATA HOLDS---//

// can also create constructor function for users, add to users obj each time new user signs up
var users = {
  "@davy-jones": {
    name: 'Davy Jones',
    avatar: 'img/alagoon.jpg'
  }
};

// empty obj to hold new tweets
var tweets = {};
// add a maxid property to track highest tweet ID
tweets.maxID = 0;

//--FUNCTIONS--//

// constructor function for new tweets
function Tweet(handle, tweet) {
  this.handle = handle;
  this.tweet = tweet;
  this.timestamp = new Date(); // get current time when tweet created, unformatted
  this.cleanTime = formatDateTime(this.timestamp);
  this.retweets = 0; // default value of zero when tweet is created
  this.favorites = 0; // ""
}

function addTweetToData(tweetObj) {
  var tweetID = tweets.maxID + 1;
  tweets.maxID = tweetID;
  tweets[tweetID] = tweetObj;
  return tweetID;
}

// format raw timestamp into twitter format
function formatDateTime(timestamp) {
  // TIME
  var hours = timestamp.getHours();
  var mins = timestamp.getMinutes();
  var ampm = 'AM';
  // if it's past 11AM, ampm turns to 'PM'
  if (hours > 11) {
    ampm = 'PM';
  }

  // if 1PM or later, make hour into 12HR time
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) { // turn 0 hour into midnight
    hours = 12;
  }

  // add zero onto single digit minutes
  if (mins < 10) {
    mins = "0" + mins;
  }

  // create full time string
  var timeStr = hours + ":" + mins + " " + ampm;

  // DATE
  var day = timestamp.getDate();
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var month = monthNames[timestamp.getMonth() - 1]; // adjust for array indexing
  var year = timestamp.getFullYear().toString().slice(-2); // two digit year

  // create full date string
  var dateStr = day + " " + month + " " + year;

  // create final, formatted timestamp string and return
  var finalStr = timeStr + ' - ' + dateStr;

  return finalStr;
}

function formatTweetObj(tweetObj, tweetID) {

  var handle = tweetObj.handle;
  var tweetText = tweetObj.tweet;

  var tweetHTML = `
  <div class="tweet" id="tweet${tweetID}">
    <div class="content">
      <img class="avatar" src="${users[handle].avatar}" />
      <strong class="fullname">${users[handle].name}</strong>
      <span class="username">${handle}</span>
      <p class="tweet-text">${tweetText}</p>
      <div class="tweet-actions">
        <ul>
          <li><span class="icon action-reply"></span> Reply</li>
          <li><span class="icon action-retweet"></span> Retweet</li>
          <li><span class="icon action-favorite"></span> Favorite</li>
          <li><span class="icon action-more"></span> More</li>
        </ul>
      </div>
      <div class="stats">
        <div class="retweets">
          <p class="num-retweets">${tweetObj.retweets}</p>
          <p>RETWEETS</p>
        </div>
        <div class="favorites">
          <p class="num-favorites">${tweetObj.favorites}</p>
          <p>FAVORITES</p>
        </div>
        <div class="users-interact">
          <div>
            <img src="img/alagoon.jpg" />
            <img src="img/vklimenko.jpg" />
          </div>
        </div>
        <div class="time">
          ${tweetObj.cleanTime}
        </div>
      </div>
      <div class="reply">
        <img class="avatar" src="img/alagoon.jpg" />
        <textarea class="tweet-compose" placeholder="Reply to ${handle}"/></textarea>
      </div>
    </div>
  </div><!-- .tweet -->`;

  return tweetHTML;
}

//---EVENT LISTENERS---//

// when tweet-compose textarea is entered, double the size of the box
$('.tweet-compose').on({
  focus: function() {
    $(this).height('5em');
    $('#tweet-controls').show();
  },
  blur: function() {
    if ($(this).val().length === 0) {
      $(this).removeAttr('style'); //undos height change, reverts back to CSS
      $('#tweet-controls').hide();
    }
  },
  keyup: function() {
    var charCount = 140 - $(this).val().length;
    var $charElem = $('#char-count');
    var $buttElem = $('#tweet-submit');
    $charElem.text(charCount);
    if (charCount <= 10 && charCount >= 0) {
      $charElem.css('color', 'red'); //inline > id, otherwise would use addClass
      $buttElem.prop('disabled', false);
    } else if (charCount < 0) {
      $buttElem.prop('disabled', true);
    } else {
      // reset each if charCount is OK
      $charElem.removeAttr('style');
    }
  }
});

// when tweet submitted, create new tweet object with form data
$('#tweet-submit').on('click', function() {
  var tweetText = $('.tweet-compose').val();
  var handle = $('#handle').text();
  if (/\S/.test(tweetText)) { // if not empty tweet
    var tweetObj = new Tweet(handle, tweetText); // create tweet object %
    var tweetID = addTweetToData(tweetObj); // add tweet to tweets data hold, return ID %
    var tweetHtml = formatTweetObj(tweetObj, tweetID); // format HTML for tweet %
    $('#stream').prepend(tweetHtml); // use prepend method on stream
    $('.tweet-compose').val('');
  } else {
    alert('Please enter something to tweet!');
  }
});

// when tweet is clicked on, expose stats section. add listener to stream div and delegate to .tweet divs (to handle new tweets)

function toggleViz(statsObj, replyObj, actionsObj, onlyOpen) {
  if (!(statsObj.hasClass('viz') && replyObj.hasClass('viz'))) { // if not already viz, make viz
    statsObj.slideDown().addClass('viz');
    replyObj.slideDown().addClass('viz');
    actionsObj.css('display', 'block'); // keep .tweet-actions showing
  } else if (!onlyOpen){
    statsObj.slideUp().removeClass('viz');
    replyObj.slideUp().removeClass('viz'); // slide up & remove viz class
    actionsObj.css('display', ''); // revert to default CSS for .tweet-actions
  }
}

$('#stream').on('click', '.tweet-text, .avatar, .fullname, .username, .stats, .reply', function(e) {
  var $stats = $(this).siblings('.stats'); // why can't I select both siblings? tried normal syntax
  var $reply = $(this).siblings('.reply');
  var $actions = $(this).closest('.tweet').find('.tweet-actions');

  console.log($stats.attr('class'), $reply.attr('class'));

  toggleViz($stats, $reply, $actions);
});

// whenever action button is clicked on (the li, delegated to account for new tweets)
$('#stream').on('click', '.tweet-actions li', function() { // need to click on parent li, clicking on icon doesn't work. li itself has no class/id
  var buttonClicked = $(this).text(); // which button was clicked?
  var targetClass; // what's the class of the element that needs changing?
  if (buttonClicked === ' Retweet') { // if retweet clicked, target .num-retweets
    targetClass = '.num-retweets'; // can also set property to update object
  } else if (buttonClicked === ' Favorite') { // if favorite clicked, target .num-favorites
    targetClass = '.num-favorites';
  } else {
    return 'Button does nothing.'
  }

  // update corresponding counter, based on button clicked & target
  var elem = $(this).closest('.tweet-actions').next('.stats').find(targetClass);
  var newQ = parseInt(elem.text()) + 1;
  elem.text(newQ);

  // target elements to animate when clicking
  var $stats = $(this).closest('.tweet-actions').siblings('.stats');
  var $reply = $(this).closest('.tweet-actions').siblings('.reply');
  var $actions = $(this).closest('.tweet-actions');

  // toggle viz of elements
  toggleViz($stats, $reply, $actions, true);

});
