let fs = require('fs').promises;

function createDirectory(path)
{
	//console.log('Try',path);
	return fs.stat(path)
	.then((x)=>
	{
		//console.log('stat', x );
		if( !x.isDirectory() )
			return fs.mkdir(path)

		return Promise.resolve(true);
	},(error)=>
	{
		return fs.mkdir(path)
		//console.log("Error aqui",error);
		//throw error;
	});
}

function toCamelCaseUpperCase(s)
{
	let x = s.replace(/^[a-z]/,i=>i.toUpperCase());

	return x.replace(/([-_][a-z])/ig, ($1) => {
		return $1.toUpperCase()
			.replace('-', '')
			.replace('_', '');
	});
}

function toCamel(s)
{
	return s.replace(/([-_][a-z])/ig, ($1) => {
		return $1.toUpperCase()
			.replace('-', '')
			.replace('_', '');
	});
};

function getSnakeCaseUpperCase(s)
{
	let x = s.replace(/^[a-z]/,i=>i ? i.toUpperCase(): '');

	return x.replace(/([-_][a-z])/ig,($1)=>{
		return $1.toUpperCase();
	});
}

function getInputType(type)
{
	if( /^int/.test( type ) ||  /^double/.test(type ) ||/^decimal/.test( type ) || /^float/.test(type) || /^tinyint/.test(type) || /^bigint/.test(type) )
	{
		return 'number';
	}
	else if( /^timestamp/.test(type ) )
	{
		return 'Date';
	}
	else if( /^varchar/.test( type ) || /^date/.test( type ) || /^time/.test( type ) || /^enum/.test( type ) || /^text/.test( type ) || /^mediumtext/.test( type ) || /^datetime/.test(type) )
	{
		return 'string';
	}
}

function createAngularProject(app_name)
{

}

exports.createDirectory = createDirectory;
exports.toCamelCaseUpperCase = toCamelCaseUpperCase;
exports.toCamel = toCamel;
exports.getSnakeCaseUpperCase = getSnakeCaseUpperCase;
exports.getInputType = getInputType;

