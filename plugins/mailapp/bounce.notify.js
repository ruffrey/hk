var nano = require('nano')('http://127.0.0.1:5984');

exports.hook_bounce = function (next, connection) {
	
	function lgr(er){
		fn.logerror('Bounce update failed. '
			+rcpt + ' - '
			+connection.todo.notes.usr
			+'/'+connection.todo.notes.cid
			+'  '
			+er.message
		);
	}
	
	
	var rcpt = connection.todo.rcpt_to[0].user +'@'+ connection.todo.rcpt_to[0].host
	  , fn = this;
	
	if( connection.notes.usr && connection.notes.cid )
	{
		fn.logerror('\n\nBounced: '+rcpt +' | '
			+ connection.todo.notes.usr
			+ '/' + connection.todo.notes.cid
		);
		
		this.loginfo('\n\n'+JSON.stringify(connection)+'\n\n');
		
		var d = nano.db.use(connection.notes.usr+'_campaigns')
		
		d.get(connection.notes.cid, function(err,body){
			if(err)
			{
				lgr(fn,connection.todo,err);
			}
			else{
				(!body.failed_recipients) && (body.failed_recipients = []);
				body.failed_recipients.push(rcpt);
				d.insert(body, function(err,resp){
					if(err)
					{
						lgr(err.message);
					}
					else{
						fn.loginfo('MailApp was notified about bounce.');
					}
				});
			}
		});
	}
	
	/* sending CONT tells Haraka not to send a bounce message */
	next(CONT, 'Logging bounce for MailApp');
}