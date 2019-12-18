let fs = require('fs').promises;

function createDirectory(path)
{
	//console.log('Try',path);
	return fs.stat(path)
	.then((x)=>
	{
		//console.log('stat', x );
		if( !x.isDirectory() )
			return fs.mkdir(path,{ recursive: true })

		return Promise.resolve(true);
	},(error)=>
	{
		return fs.mkdir(path,{recursive:true})
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

function toCamelCase(s)
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


function getInputField(field_info,table_name,constraints,tables_info)
{
	let ngmodel = table_name+'.'+field_info.Field;
	let name = field_info.Field;


	if( constraints)
	{
		//console.log('YES BUT',constraints.length );
		//console.log('Constraints is ',constraints );

		//console.log('COlumntto search',name);
		if( constraints.some( f=> name == f.COLUMN_NAME ) )
		{
			let f = constraints.find( f=> name == f.COLUMN_NAME );

			let field_name = f.REFERENCED_COLUMN_NAME;

			if( tables_info )
			{
				let x = tables_info[ f.REFERENCED_TABLE_NAME ].fields.find((x)=> getInputType(x.Type ) == 'string' );
				if( x )
					field_name = x.Field;

				//console.log('FOUND ',table_name,field_name );
			}

			return `<select name="${name}" [(ngModel)]="${ngmodel}" class="form-control">\n
						<option *ngFor="let c of ${f.REFERENCED_TABLE_NAME}_list" [value]="c.${f.REFERENCED_COLUMN_NAME}">{{c.${field_name}}}</option>
					</select>`;
		}
	}

	if( /^int/.test( field_info.Type ) ||  /^double/.test(field_info.Type ) ||/^decimal/.test( field_info.Type ) || /^float/.test(field_info.Type) || /^tinyint/.test(field_info.Type) || /^bigint/.test(field_info.Type) )
	{
		return `<input type="number" name="${name}" [(ngModel)]="${ngmodel}" class="form-control">`;
	}
	else if( /^varchar/.test( field_info.Type ) )
	{
		return `<input type="text" name="${name}" [(ngModel)]="${ngmodel}" class="form-control">\n`;
	}
	else if( /^timestamp/.test(field_info.Type ) || /^datetime/.test(field_info.Type) )
	{
		return `<input type="datetime-local" name="${name}" [(ngModel)]="${ngmodel}" class="form-control">`;
	}
	else if( /^date/.test( field_info.Type ) )
	{
		return `<input type="date" name="${name}" [(ngModel)]="${ngmodel}" class="form-control">`;
	}
	else if( /^time/.test( field_info.Type ) )
	{
		return `<input type="time" name="${name}" [(ngModel)]="${ngmodel}" class="form-control">`;
	}
	else if( /^text/.test( field_info.Type ) || /^mediumtext/.test( field_info.Type ) )
	{
		return `<textarea class="form-control" name="${name}" [(ngModel)]="${ngmodel}"></textarea>`;
	}
	else if( /^enum/.test( field_info.Type ) )
	{
		let options = field_info.Type.replace(/enum\((.*)\)/,'$1').split(',');

		let s =`<select name="${name}" [(ngModel)]="${ngmodel}" class="form-control">\n`;
		options.forEach((i)=>
		{
			let t = i.replace(/'(.*)'/,'$1');
			s+='\t\t\t\t<option value="'+t+'">'+t+'</option>\n';
		});
		s+='</select>';
		return s;
	}
	//else console.log( field_info.Type );
}

exports.createDirectory = createDirectory;
exports.toCamelCaseUpperCase = toCamelCaseUpperCase;
exports.toCamelCase = toCamelCase;
exports.getSnakeCaseUpperCase = getSnakeCaseUpperCase;
exports.getInputType = getInputType;
exports.getInputField = getInputField;


