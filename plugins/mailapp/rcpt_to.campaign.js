exports.hook_rcpt = function (next, connection, params) {
    var rcpt = params[0]
	   ,re = /\-\_\-/g;
	   
	this.loginfo(params);
	
    this.loginfo("Got recipient: " + rcpt);

	/* Check user matches regex 'useremail-_-cid-_-login-_-@google.com' */
	if( !re.test(rcpt.user) ) 
	{
        return next();
    }
	
	
	var aTo = rcpt.user.split(re);
	
	!connection.transaction.notes && ( connection.transaction.notes = {} );
	connection.transaction.notes.cid = aTo[1];
	connection.transaction.notes.usr = aTo[2];
	
    /* now get rid of the extension */
	rcpt.user = aTo[0] + aTo[3];
	
    this.loginfo("Email address now: " + rcpt);
	
	params[0] = rcpt;
    next();
}