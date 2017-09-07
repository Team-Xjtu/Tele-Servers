//file.obj -> file.js
var exec = require('child_process').exec;
exec('python ' + arg1 + ' -i ' + arg2 + ' -o ' + arg3, function(error,stdout,stderr){
    if(stdout.length >1){
        console.log('you offer args:',stdout);
    } else {
        console.log('you don\'t offer args');
    }
    if(error) {
        console.info('stderr : '+stderr);
    }
});