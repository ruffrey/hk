var nano = require('nano')('http://127.0.0.1:5984');

exports.hook_bounce = function (next, connection) {
	
	var rcpt = connection.todo.rcpt_to[0].user 
		+ '@'
		+ connection.todo.rcpt_to[0].host;
	
	function lgr(er){
		fn.logerror(
			+rcpt + ' - '
			+connection.todo.notes.usr
			+'/'+connection.todo.notes.cid
			+'  '
			+er
		);
	}
	
	function notifyBounce(wait_for){
	  setTimeout(function(){
	  
		d.get(connection.notes.cid, function(err,body){
			if(err)
			{
				lgr(err.message);
			}
			else{
				if(body.failed_recipients.indexOf(rcpt)==-1)
				{
					body.failed_recipients.push(rcpt);
					body.total_failed_recipients++;
					d.insert(body, function(err,resp){
						if(err)
						{
							if( retried_times < 3 )
							{
								retried_times++;
								
								wait_time = !wait_time ? 1000 : wait_time * 2;
								
								lgr('Bounce notify failed, try again in '
									+wait_time
									+'ms. ('
									+err.message
									+')'
								);
								
								notifyBounce(wait_time);
							}
							else{
								lgr('Total failure of bounce notify: all retries failed.');
							}
						}
						else{
							lgr('MailApp was notified about bounce.');
						}
					});
				}
				
				// else all done because couch was already notified
			}
		});
		
	  }, wait_for);
	}
	
	
	if( connection.notes.usr && connection.notes.cid )
	{
		
		var retried_times = 0
		   ,wait_time = 0
		   ,d = nano.db.use(connection.notes.usr+'_campaigns')
		   ,fn = this;
		
	
		fn.logerror('Bounced: '+rcpt +', '
			+ connection.todo.notes.usr
			+ '/' + connection.todo.notes.cid
		);
			
		notifyBounce(wait_time);
		
	}
	
	/* sending STOP tells Haraka not to send a bounce message and to
	 * delete from the queue directory */
	next(STOP, 'Logging bounce for MailApp and stopping (STOP)');
}