const { createDirectory,toCamelCaseUpperCase,toCamel,getSnakeCaseUpperCase,getInputType  } = require('./functions.js');
const schema = require('./example.json');
let fs = require('fs').promises;


Promise.all
([
	createDirectory('./dist/')
	,createDirectory('./dist/angular')
	,createDirectory('./dist/server')
])
.then(()=>
{
	let promises = [];
	promises.push( fs.readFile('./templates/rest.php',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/rest.service.ts',{encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.ts',{ encoding:'utf8'}));

	return Promise.all( promises );
})
.then((fileContents)=>
{
	let restphp = fileContents[0];
	let restService = fileContents[1];

	return {
		restphp							: fileContents[0]
		,rest_service					: fileContents[1]
		,save_template_component_html	: fileContents[2]
		,save_template_component_ts		: fileContents[3]
		,list_template_component_html	: fileContents[4]
		,list_template_component_ts		: fileContents[5]
	}
})
.then((responses)=>
{
	//console.log( responses.restphp );
	let filesPromises= [];

	let rest_imports		= '';
	let rest_declarations	= '';
	let rest_initialization	= '';

	for(let i in schema)
	{
		let tinfo  = createTableInfo(i,schema[i] );
		let phpfile = responses.restphp.replace(/{{TABLE_NAME}}/g,tinfo.name);
		filesPromises.push( fs.writeFile('./dist/server/'+tinfo.name+'.php',phpfile ) );

		rest_imports		+= tinfo.obj_rest_import;
		rest_declarations	+= tinfo.obj_rest_declaration;
		rest_initialization	+= tinfo.obj_rest_initialization;

		let list_template_content_html	= responses.list_template_component_html
			.replace(/TEMPLATE_TABLE_NAME/g,tinfo.name)
			.replace(/TEMPLATE_FIELDS_TABLE_HEADERS/g,tinfo.table_headers.join('\n') )
			.replace(/TEMPLATE_FIELDS_TABLE_VALUES/g,tinfo.table_values )
			.replace(/TEMPLATE_SEARCH_FIELDS/g,tinfo.template_search_fields	 );

		let list_template_content_ts = responses.list_template_component_ts
			.replace(/TABLE_NAME_CAMEL_CASE/g,tinfo.camel_case )
			.replace(/TABLE_NAME_MODEL/g,tinfo.camel_case_uppercase)
			.replace(/SNAKE_CASE_UPPERCASE/g,tinfo.snake_case_uppercase )
			.replace(/TABLE_SEARCH_PARAMS/g,tinfo.table_search_params.join('\n\t\t\t') )
			.replace(/TABLE_DASH_NAME/g,tinfo.dash_table_name )
			.replace(/TABLE_NAME/g,tinfo.name );

		let save_template_content_ts = responses.save_template_component_ts
			.replace(/SNAKE_CASE_UPPERCASE/g,tinfo.snake_case_uppercase)
			.replace(/DASH_TABLE_NAME/g,tinfo.dash_table_name )
			.replace(/TABLE_NAME_CAMEL_CASE/g,tinfo.camel_case_uppercase )
			.replace(/FORK_JOIN_IMPORTS/g,tinfo.fork_join_import.join('\n'))
			.replace(/FORK_JOIN_DECLARATION/g,tinfo.fork_join_declaration.join('\n'))
			.replace(/FORK_JOIN_ID/g,tinfo.fork_join_id )
			.replace(/FORK_JOIN_CONSTRAINTS/g,tinfo.fork_join_constraints )
			.replace(/TABLE_NAME/g,tinfo.name )

		let save_template_content_html = responses.save_template_component_html
			.replace(/SNAKE_CASE_UPPERCASE/g,tinfo.snake_case_uppercase )
			.replace(/TEMPLATE_SAVE_INPUTS/g,tinfo.template_save_inputs.join('\n'))
			.replace(/TABLE_NAME/g,tinfo.name );


		filesPromises.push
		(
			Promise.all([
				createDirectory('./dist/angular/list-'+tinfo.dash_table_name)
				,createDirectory('./dist/angular/save-'+tinfo.dash_table_name)
			])
			.then(()=>
			{
				return Promise.all([
					fs.writeFile('./dist/angular/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.ts',list_template_content_ts )
					,fs.writeFile('./dist/angular/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.html',list_template_content_html)
					,fs.writeFile('./dist/angular/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.ts',save_template_content_ts)
					,fs.writeFile('./dist/angular/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.html',save_template_content_html)
				]);
			})
		);
		//Rest
	}

	rest_file_content = responses.rest_service
				.replace(/TEMPLATE_IMPORT_MODELS_TEMPLATE/g,rest_imports )
				.replace(/TEMPLATE_OBJ_REST_DECLARATION/g,rest_declarations )
				.replace(/TEMPLATE_OBJ_REST_INITIALIZATION/g,rest_initialization );


	filesPromises.push( fs.writeFile('./dist/angular/rest.service.ts', rest_file_content ) );

	return Promise.all( filesPromises );
})
.then(()=>
{
	console.log("SUCESS");
}
,(error)=>
{
	console.log( error );
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
	table.camel_case			= toCamelCaseUpperCase( i );
	table.camel_case_uppercase	= toCamelCaseUpperCase( i );
	table.dash_table_name		= i.replace(/_/g,'-');

	table.table_search_params		= [];
	table.table_headers				= [];
	table.template_search_fields	= [];
	table.template_save_inputs		= [];
	table.table_values				= [];


	let model_fields		= '\n';

    table.fork_joins		= [];
	/*{
		CONSTRAINT_CATALOG: 'def',
		CONSTRAINT_SCHEMA: 'centrosmedicos',
		CONSTRAINT_NAME: 'venta_ibfk_2',
		TABLE_CATALOG: 'def',
		TABLE_SCHEMA: 'centrosmedicos',
		TABLE_NAME: 'venta',
		COLUMN_NAME: 'id_usuario_recepcionista',
		ORDINAL_POSITION: 1,
		POSITION_IN_UNIQUE_CONSTRAINT: 1,
		REFERENCED_TABLE_SCHEMA: 'centrosmedicos',
		REFERENCED_TABLE_NAME: 'usuario',
		REFERENCED_COLUMN_NAME: 'id'
	}
	*/

	table.fork_join_import 		= [];
	table.fork_join_observable	= [];
	table.fork_join_assignation = [];
	table.fork_join_declaration	= [];
	table.fork_join_assignation1 = [];
	table.fork_join_assignation0 = [];
	table.fork_join_single		= '';

	info.contraints.forEach((k,index)=>
	{
		table.fork_join_import.push('import {'+k.REFERENCED_TABLE_NAME+'} from \'../../models/Modelos');
		table.fork_join_observable.push('this.rest.'+k.REFERENCED_TABLE_NAME+'.getAll({})');
		table.fork_join_declaration.push(k.REFERENCED_TABLE_NAME+'_list:'+getSnakeCaseUpperCase( k.REFERENCED_TABLE_NAME )+'[] = [];');
		table.fork_join_assignation1.push('this.'+k.REFERENCED_TABLE_NAME+'_list=responses['+(index+1)+'].data;');
		table.fork_join_assignation0.push('this.'+k.REFERENCED_TABLE_NAME+'_list=responses['+index+'].data;');
		table.fork_join_single = `this.rest.${k.REFERENCED_TABLE_NAME}.getAll({}).subscribe((response)=>
				{
					${k.REFERENCED_TABLE_NAME}_list=response.data;
				}
				,(error)=>this.showError(error));`;
	});

	if( table.fork_join_declaration.length == 0 )
	{
		table.fork_join_id = `this.rest.${table.name}.get( id ).subscribe(('+table.name+')=>
			{
				this.is_loading = false;
				this.${table.name}= ${table.name};
			},(error)=>
			{
				this.is_loading = false;
				this.showError( error );
			});\n`
	}
	else
	{
		table.fork_join_id	= `forkJoin([
					this.rest.${table.name}.get( id ),
					${table.fork_join_observable.join(',\n\t\t\t\t\t')}
				])
				.subscribe((responses)=>
				{
					this.${table.name} = responses[0];
					${table.fork_join_assignation1.join('\n\t\t\t\t\t')}
				});\n`

		if( table.fork_join_observable.length == 1 )
		{
			table.fork_join_constraints = table.fork_join_single;
		}
		else
		{
			table.fork_join_constraints = `forkJoin([
					${table.fork_join_observable.join(',\n\t\t\t\t\t')}
				])
				.subscribe((responses)=>
				{
					this.is_loading = false;
					${table.fork_join_assignation0.join('\n\t\t\t\t\t')}
				}
				(error)=>this.showError(error));\n`
		}
	}

	if( table.fork_join_import.length == 0 )
		table.fork_join_str = '';

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

		let input_field	= getInputField(f,table.snake_case,field, info.contraints );
		//console.log( input_field );
		table.template_save_inputs.push(`\t\t\t<div class="mt-3 mb-3">
				<label class="">${field.name}</label>
				${input_field}
			</div>\n`);

		table.template_search_fields.push(`\t\t\t<div class="pr-2">
				<label>${field.snake_case.replace(/_/g,' ')}</label>
				<input type="text" [(ngModel)]="${search_ng_model}">
			</div>\n`);

		model_fields+='\t\t'+field.snake_case+'?\t:'+getInputType( f.Type )+';\n';
	});


	table.obj_rest_import			= `import {${table.snake_case_uppercase}} from '../models/Modelos';\n`;
	table.obj_rest_declaration		= `\tpublic ${table.snake_case}:ObjRest<${table.snake_case_uppercase}>;\n`;
	table.obj_rest_initialization	= '\t\tthis.'+table.snake_case+'\t= new ObjRest<'+table.snake_case_uppercase+'>(`${this.urlBase}/bitacora.php`,http);\n';

	//console.log( table.obj_rest_initialization );

	table.model = `	export interface ${table.snake_case_uppercase} {
			${model_fields}
		}`

	//console.log( table.obj_rest_import );
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


function getInputField(field_info,table_snake_case,field_names,constraints)
{
	let ngmodel = table_snake_case+'.'+field_names.snake_case;
	let name = field_names.snake_case;

	if( constraints && constraints.some( f=> name == f.COLUMN_NAME ) )
	{
		let f = constraints.find( f=> name == f.COLUMN_NAME );

		return `<select name="${name}" [(ngModel)]="${ngmodel}">\n
					<option *ngFor="let c of ${f.REFERENCED_TABLE_NAME}_list" [value]="c.${f.REFERENCED_COLUMN_NAME}">{{c.${f.REFERENCED_COLUMN_NAME}}}</option>
				</select>`;
	}

	if( /^int/.test( field_info.Type ) ||  /^double/.test(field_info.Type ) ||/^decimal/.test( field_info.Type ) || /^float/.test(field_info.Type) || /^tinyint/.test(field_info.Type) || /^bigint/.test(field_info.Type) )
	{
		return `<input type="number" name="${name}" [(ngModel)]="${ngmodel}">`;
	}
	else if( /^varchar/.test( field_info.Type ) )
	{
		return `<input type="text" name="${name}" [(ngModel)]="${ngmodel}">\n`;
	}
	else if( /^timestamp/.test(field_info.Type ) || /^datetime/.test(field_info.Type) )
	{
		return `<input type="datetime-local" name="${name}" [(ngModel)]="${ngmodel}">`;
	}
	else if( /^date/.test( field_info.Type ) )
	{
		return `<input type="date" name="${name}" [(ngModel)]="${ngmodel}">`;
	}
	else if( /^time/.test( field_info.Type ) )
	{
		return `<input type="time" name="${name}" [(ngModel)]="${ngmodel}">`;
	}
	else if( /^text/.test( field_info.Type ) || /^mediumtext/.test( field_info.Type ) )
	{
		return `<textearea name="${name}" [(ngModel)]="${ngmodel}"></textarea>`;
	}
	else if( /^enum/.test( field_info.Type ) )
	{
		let options = field_info.Type.replace(/enum\((.*)\)/,'$1').split(',');

		let s =`<select name="${name}" [(ngModel)]="${ngmodel}">\n`;
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


