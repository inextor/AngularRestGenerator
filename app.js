let fs = require('fs').promises;

const schema = require('./example.json');

let promises = [];

promises.push( fs.readFile('./templates/rest.php',{ encoding:'utf8'}));
promises.push( fs.readFile('./templates/rest.service.ts',{encoding:'utf8'}));
promises.push( fs.readFile('./templates/save-template.component.html',{ encoding:'utf8'}));
promises.push( fs.readFile('./templates/list-template.component.html',{ encoding:'utf8'}));
promises.push( fs.readFile('./templates/save-template.component.ts',{ encoding:'utf8'}));

Promise.all( promises ).then((fileContents)=>
{
	let restphp = fileContents[0];
	let restService = fileContents[1];


	return {
		restphp							: fileContents[0]
		,rest_service					: fileContents[1]
		,save_template_component_html	: fileContents[2]
		,list_template_component_ts		: fileContents[3]
		,
	}
})
.then((responses)=>
{
	console.log( responses.restphp );
	for(let i in schema)
	{
//		let tinfo  = createTableInfo(i,schema[i] );
	}
});




function createTableInfo( i, info )
{
	//console.log('Table Name', i);

	let table = {};
	let constraints = info.constraints;
	let fields = [];

	table.name					= i;
	table.snake_case			= i;
	table.snake_case_uppercase	= getSnakeCaseUpperCase( i );
	table.camel_case			= toCamel( i );
	table.camel_case_uppercase	= toCamelCaseUpperCase( i );

	table.table_search_params		= [];
	table.table_headers				= [];
	table.template_search_fields	= [];
	table.template_save_inputs		= [];
	table.table_values				= [];

	let model_fields		= '\n';

	info.fields.forEach((f,index)=>
	{
		let field = {
			name		: f.Field,
			snake_case 	: f.Field,
			camel_case 	: toCamel( f.Field ),
		};


		table.table_search_params.push( 'this.'+table.snake_case+'_search.eq.'+field.snake_case+'\t= params.get("eq."'+field.snake_case+'")?params.get("eq.'+field.snake_case+'"):null;');
		table.table_search_params.push( 'this.'+table.snake_case+'_search.le.'+field.snake_case+'\t= params.get("le."'+field.snake_case+'")?params.get("le.'+field.snake_case+'"):null;');
		table.table_search_params.push( 'this.'+table.snake_case+'_search.lt.'+field.snake_case+'\t= params.get("lt."'+field.snake_case+'")?params.get("lt.'+field.snake_case+'"):null;');
		table.table_search_params.push( 'this.'+table.snake_case+'_search.ge.'+field.snake_case+'\t= params.get("ge."'+field.snake_case+'")?params.get("ge.'+field.snake_case+'"):null;');
		table.table_search_params.push( 'this.'+table.snake_case+'_search.gt.'+field.snake_case+'\t= params.get("gt."'+field.snake_case+'")?params.get("gt.'+field.snake_case+'"):null;');
		table.table_search_params.push( 'this.'+table.snake_case+'_search.lk.'+field.snake_case+'\t= params.get("lk."'+field.snake_case+'")?params.get("lk.'+field.snake_case+'"):null;');

		table.table_values.push('<td>{{'+field.snake_case+'}}</td>');
		table.table_headers.push('<th>'+(field.snake_case.replace(/_/g,' '))+'</th>');
		let search_ng_model = table.snake_case+'_search.eq.'+field.snake_case;

		let input_field	= getInputField(f,table.snake_case,field);
		//console.log( input_field );
		table.template_save_inputs.push(`\t\t\t<div class="mt-3 mb-3">
				<label class="">Diagnostico</label>
				${input_field}
			</div>\n`);

		table.template_search_fields.push(`\t\t\t<div class="pr-2">
				<label>${field.snake_case.replace(/_/g,' ')}</label>
				<input type="text" [(ngModel)]="${search_ng_model}">
			</div>\n`);

		model_fields+='\t\t'+field.snake_case+'?\t:'+getInputType( f.Type )+';\n';
	});


	table.obj_rest_import			= `import {${table.snake_case_uppercase}} from '../models/Modelos';\n`;
	table.obj_rest_declaration		= `public ${table.snake_case}:ObjRest<${table.snake_case_uppercase}>;\n`;
	table.obj_rest_initialization	= '\nthis.'+table.snake_case+' = new ObjRest<'+table.snake_case_uppercase+'>(`${this.urlBase}/bitacora.php`,http);\n';

	console.log( table.obj_rest_initialization );

	table.model = `	export interface ${table.snake_case_uppercase} {
			${model_fields}
		}`

	console.log( table.obj_rest_import );
	//TEMPLATE_OBJ_REST_DECLARATION //Rest
	//TEMPLATE_OBJ_REST_INITIALIZATION
	//TEMPLATE_IMPORT_MODELS_TEMPLATE //Rest
	//console.log( table );
	//TEMPLATE_SEARCH_FIELDS
	//TEMPLATE_LIST_TABLE_NAME   //nombre de la ruta para las listas
	//TEMPLATE_TABLE_NAME
	//TEMPLATE_FIELDS_TABLE_HEADERS
	//TEMPLATE_FIELDS_TABLE_VALUES

	return table;
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

function getInputField(field_info,table_camel_case,field_names)
{
	let ngmodel = table_camel_case+'.'+field_names.camel_case;

	if( /^int/.test( field_info.Type ) ||  /^double/.test(field_info.Type ) ||/^decimal/.test( field_info.Type ) || /^float/.test(field_info.Type) || /^tinyint/.test(field_info.Type) || /^bigint/.test(field_info.Type) )
	{
		return `\t\t\t<input type="number" name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^varchar/.test( field_info.Type ) )
	{
		return `\t\t\t<input type="text"  name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^timestamp/.test(field_info.Type ) || /^datetime/.test(field_info.Type) )
	{
		return `\t\t\t<input type="datetime-local"  name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^date/.test( field_info.Type ) )
	{
		return `\t\t\t<input type="date"  name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^time/.test( field_info.Type ) )
	{
		return `\t\t\t<input type="time"  name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^text/.test( field_info.Type ) || /^mediumtext/.test( field_info.Type ) )
	{
		return `\t\t\t<textearea name="field_names.snake_case" [(ngModel)]="${ngmodel}"></textarea>\n`;
	}
	else if( /^enum/.test( field_info.Type ) )
	{
		let options = field_info.Type.replace(/enum\((.*)\)/,'$1').split(',');

		let s =`<select name="field_names.snake_case" [(ngModel)]="${ngmodel}">\n`;
		options.forEach((i)=>
		{
			let t = i.replace(/'(.*)'/,'$1');
			s+='\t\t\t\t<option value="'+t+'">'+t+'</option>\n';
		});
		s+='\t\t\t</select>\n';
		return s;
	}
	else console.log( field_info.Type );
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
