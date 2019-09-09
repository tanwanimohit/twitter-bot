var config = require('./config.js');
var Twitter = require('twitter');
const https = require('https');
const request = require('request');
const express = require('express');
const app = express();

var client = new Twitter(config);

var stream = client.stream('statuses/filter', {track: '@BotRaju'});
stream.on('data', function(event) {
	
  //console.log(event.text);
  //console.log(event);
   
	like(event);
	Reply(event);
  
});

const app = express();
app.use(express.static('views'));

app.get('/', (req, res) => {
	
	res.render('home');
});

 
function like(main)
{
   var res2= {
	  Name : "I liked this tweet ",
	  id:main.id_str,
   }
  
    client.post('favorites/create', res2,
    function(err, data, response) {
      //console.log(data);
    }
  ); 
  
}

function Reply(main)
{
  var text=(main.text).toLowerCase();
  
  if(text.includes("quote") )
  {
	if(text.includes("not") || text.includes("donot") || text.includes("don't"))
	{
		SendFine(main);
	}
	else {
	  SendQuote(main);
	}
  }
  else if(text.includes("joke") )
  {
	if(text.includes("not") || text.includes("donot") || text.includes("don't"))
	{
		SendFine(main);
	}
	else {
		SendJoke(main);
	}
  }
  else if(text.includes("-help") )
  {
	  Help(main);
  }
  else
  {
	  let reg = new RegExp("@botraju")
	  text=text.replace(reg,'');
	  if(text!=null && text.length>=2) SendDuckDuckGo(main,text);
	  else Help(main);
  }
  
}

function SendFine(main)
{
	var res = {
		status: 'Hello '+main.user.name+', As your Wish :( ',
		in_reply_to_status_id:  main.id_str,
		auto_populate_reply_metadata:true
		};
		
		client.post('statuses/update', res,
		function(err, data, response) {
		  console.log(data);
		}
		); 
}

function SendQuote(main)
{
	https.get('https://freequote.herokuapp.com/', (resp) => {
	let data = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
		data += chunk;
		var res = {
		status: 'Hello '+main.user.name+', Here is the quote for you : \n'+JSON.parse(data).quote+' - '+JSON.parse(data).author,
		in_reply_to_status_id:  main.id_str,
		auto_populate_reply_metadata:true
		};
		
		client.post('statuses/update', res,
		function(err, data, response) {
		  console.log(data);
		}
		); 
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
		console.log(JSON.parse(data).explanation);
		
	  });

	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	});
	
	
}

function SendJoke(main)
{
	https.get('https://official-joke-api.appspot.com/random_joke', (resp) => {
	let data = '';

	  // A chunk of data has been recieved.
	  resp.on('data', (chunk) => {
		data += chunk;
		var res = {
		status: 'Hello '+main.user.name+', Here is the Joke for you : \n'+JSON.parse(data).setup+' \n'+JSON.parse(data).punchline,
		in_reply_to_status_id:  main.id_str,
		auto_populate_reply_metadata:true
		};
		
		client.post('statuses/update', res,
		function(err, data, response) {
		  console.log(data);
		}
		); 
	  });

	  // The whole response has been received. Print out the result.
	  resp.on('end', () => {
		console.log(JSON.parse(data).explanation);
		
	  });

	}).on("error", (err) => {
	  console.log("Error: " + err.message);
	});
	
	
}



function SendDuckDuckGo(main,text)
{
	
	try
	{
	var url='https://api.duckduckgo.com/?q='+text+'&format=json&pretty=2';
	console.log(url);
	
	request(url, { json: true }, (err, res, data) => {
	  if (err) { return console.log(err); }
	  var AbstractURL= data.AbstractURL;
		var Abstract= data.Abstract;
		Abstract = Abstract.split(".")[0];
		if(Abstract.length>220)
		{
			Abstract=Abstract.substr(0,220);
			Abstract+=".. ";
		}
		if(data.RelatedTopics[0]==null)
		{
			var res = {
			status: 'Hello '+main.user.name+', Sorry ! But I am still Learning, I am not sure about this ! \nTip : Do not Write who,where,whom directly write keywords for example : \nDo not Write "What is RAM", Just Write "RAM"',
			in_reply_to_status_id:  main.id_str,
			auto_populate_reply_metadata:true
			};
			
			client.post('statuses/update', res,
			function(err, data, response) {
			  console.log(data);
			}
			); 
			
			return;
		}
		var FirstURL=data.RelatedTopics[0].FirstURL;
		var FirstURLText=data.RelatedTopics[0].Text;
		FirstURLText = FirstURLText.split(".")[0];
		
		if(AbstractURL!="")
		{
			if(Abstract!="")
			{
				console.log(Abstract);
				var res = {
				status: 'Hello '+main.user.name+',\n'+Abstract+' More : '+AbstractURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				); 
			}
			else if(FirstURLText!="")
			{
				console.log("FirstURL Text2"+FirstURLText);
				var res = {
				status: 'Hello '+main.user.name+',\n'+FirstURLText+' More : '+AbstractURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true,
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				); 
			}
			else
			{
				var res = {
				status: 'Hello '+main.user.name+',  Here you Go : '+AbstractURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				);
			}
			
		}
		else if(FirstURL!="")
		{
			console.log("FirstURL");
			if(Abstract!="")
			{
				console.log("Abstract2"+Abstract);
				var res = {
				status: 'Hello '+main.user.name+',\n'+Abstract+' More : '+FirstURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true,
				media_ids: media.media_id_string
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				); 
			}
			else if(FirstURLText!="")
			{
				console.log("FirsurlText2"+FirstURLText);
				var res = {
				status: 'Hello '+main.user.name+',\n'+FirstURLText+' More : '+FirstURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				); 
			}
			else
			{
				var res = {
				status: 'Hello '+main.user.name+',  Here you Go : '+FirstURL,
				in_reply_to_status_id:  main.id_str,
				auto_populate_reply_metadata:true
				};
				
				client.post('statuses/update', res,
				function(err, data, response) {
				  console.log(data);
				}
				);
			}
		}
		else
		{
			var res = {
			status: 'Hello '+main.user.name+', Sorry ! But I am still Learning, I am not sure about this ! \nTip : Do not Write who,where,whom directly write keywords for example : \nDo not Write "What is RAM", Just Write "RAM"',
			in_reply_to_status_id:  main.id_str,
			auto_populate_reply_metadata:true
			};
			
			client.post('statuses/update', res,
			function(err, data, response) {
			  console.log(data);
			}
			); 
		}
	});
	}
	catch(e)
	{
		console.log(e);
	}
}

function Help(main)
{
	var res = {
	status: 'Hello '+main.user.name+', You can Ask me a Joke, Quote or You can get information about anything... \nTip : Do not Write who,where,whom directly write keywords for example : \nDo not Write "What is RAM", Just Write "RAM"',
	in_reply_to_status_id:  main.id_str,
	auto_populate_reply_metadata:true
	};
	
	client.post('statuses/update', res,
	function(err, data, response) {
	  console.log(data);
	}
	); 
}

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

//Set The File Type To App As EJS.
app.set('view engine', 'ejs');
