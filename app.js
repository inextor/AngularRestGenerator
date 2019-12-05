const { getInputField,createDirectory,toCamelCaseUpperCase,toCamelCase,getSnakeCaseUpperCase,getInputType,cpFile  } = require('./functions.js');
const schema = require('./example.json');
const Template = require('./templates.js');

let fs = require('fs').promises;
let fso	= require('fs');

template = new Template();

createDirectory('./dist/').then(()=>
{
	return Promise.all
	([
		createDirectory('./dist/')
		,createDirectory('./dist/angular')
		,createDirectory('./dist/server')
		,createDirectory('./dist/angular/pages')
		,createDirectory('./dist/angular/models')
		,createDirectory('./dist/angular/services')
		,createDirectory('./dist/angular/components')
	])
})
.then(()=>
{
	return Promise.all([
		createDirectory('./dist/angular/pages/base')
		,createDirectory('./dist/angular/components/loading')
	]);
})
.then(()=>
{
	let promises = [];
	promises.push( fs.readFile('./templates/rest.php',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/rest.service.ts',{encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/save-template.component.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.html',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/list-template.component.ts',{ encoding:'utf8'}));
	promises.push( fs.readFile('./templates/app-routing.module.ts',{ encoding:'utf8'}));
	promises.push( fs.copyFile('./templates/ObjRest.ts','./dist/angular/services/ObjRest.ts') );
	promises.push( fs.copyFile('./templates/base.component.ts','./dist/angular/pages/base/base.component.ts'));
	promises.push( fs.copyFile('./templates/loading.component.ts','./dist/angular/components/loading/loading.component.ts'));
	promises.push( fs.copyFile('./templates/loading.component.html','./dist/angular/components/loading/loading.component.html'));
	promises.push( fs.copyFile('./templates/SuperRest.php','./dist/server/SuperRest.php'));

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
		,app_routing_module_ts			: fileContents[6]
	}
})
.then((responses)=>
{
	//console.log( responses.restphp );
	let filesPromises= [];

	let rest_imports		= '';
	let rest_declarations	= '';
	let rest_initialization	= '';
	let models_file_string	= '';
    let routes				= [];
    let routeImports		= [];

	console.log('ng g c pages/base');
	console.log('ng g c components/loading');
	for(let i in schema)
	{
		if( i == 'configuracion' || i=='factura' )
			continue;

		let tinfo  = template.createTableInfo( i,schema[i] );

		console.log('ng g c pages/list-'+tinfo.dash_table_name );
		console.log('ng g c pages/save-'+tinfo.dash_table_name );

		routes.push( tinfo.routes );
		routeImports.push( tinfo.route_import );

		let phpfile = responses.restphp.replace(/{{TABLE_NAME}}/g,tinfo.name);
		filesPromises.push( fs.writeFile('./dist/server/'+tinfo.name+'.php',phpfile ) );


		rest_imports		+= tinfo.obj_rest_import;
		rest_declarations	+= tinfo.obj_rest_declaration;
		rest_initialization	+= tinfo.obj_rest_initialization;

		let duplas = [];

		duplas.push([ /TABLE_NAME_SPACES/g, tinfo.name_spaces ]);
		duplas.push([ /TABLE_NAME_SPACES/g, tinfo.name_spaces ]);
		duplas.push([ /TEMPLATE_SEARCH_FIELDS/g, tinfo.search_fields ]);
		duplas.push([ /TABLE_NAME_DASH/g,tinfo.dash_table_name ]);
		duplas.push([ /TABLE_NAME_SNAKE_CASE_UPPERCASE/g,tinfo.snake_case_uppercase ]);
		duplas.push([ /TABLE_NAME_CAMEL_CASE_UPPERCASE/g,tinfo.camel_case_uppercase ]);

		duplas.push([ /TEMPLATE_LIST_TABLE_HEADERS/g, tinfo.table_list_headers ]);
		duplas.push([ /TEMPLATE_LIST_TABLE_VALUES/g, tinfo.table_list_values ]);
		duplas.push([ /TEMPLATE_SEARCH_FIELDS/g, tinfo.search_fields ]);
		duplas.push([ /TEMPLATE_SEARCH_PARAMS/g, tinfo.search_params ]);
		duplas.push([ /TEMPLATE_SAVE_INPUTS/g, tinfo.table_save_inputs ]);
		duplas.push([ /FORK_JOINS_LIST/g,  tinfo.fork_joins_list ]);
		duplas.push([ /FORK_JOINS_SAVE/g,  tinfo.fork_joins_save ]);
		duplas.push([ /FORK_JOINS_DECLARATION_SAVE/g, tinfo.fork_join_declaration_save]);
		duplas.push([ /FORK_JOINS_DECLARATION_LIST/g, tinfo.fork_join_declaration_list ]);
		duplas.push([ /TEMPLATE_MODEL_IMPORTS/g, tinfo.import_models ]);
		duplas.push([ /TABLE_NAME/g,  tinfo.name ]);

		let list_template_component_html	= replace_template( responses.list_template_content_ts, duplas );
		let list_template_content_ts		= replace_template( responses.list_template_component_ts, duplas );
		let save_template_content_ts		= replace_template( responses.save_template_component_ts, duplas );
		let save_template_content_html 		= replace_template( responses.save_template_component_html, duplas );



		models_file_string += tinfo.model+'\n\n';

		filesPromises.push
		(
			Promise.all([
				createDirectory('./dist/angular/pages/list-'+tinfo.dash_table_name)
				,createDirectory('./dist/angular/pages/save-'+tinfo.dash_table_name)
			])
			.then(()=>
			{
				return Promise.all([
					fs.writeFile('./dist/angular/pages/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.ts',list_template_content_ts )
					,fs.writeFile('./dist/angular/pages/list-'+tinfo.dash_table_name+'/list-'+tinfo.dash_table_name+'.component.html',list_template_component_html)
					,fs.writeFile('./dist/angular/pages/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.ts',save_template_content_ts)
					,fs.writeFile('./dist/angular/pages/save-'+tinfo.dash_table_name+'/save-'+tinfo.dash_table_name+'.component.html',save_template_content_html)
				]);
			})
		);
		//Rest
	}

	rest_file_content = responses.rest_service
				.replace(/TEMPLATE_IMPORT_MODELS_TEMPLATE/g,rest_imports )
				.replace(/TEMPLATE_OBJ_REST_DECLARATION/g,rest_declarations )
				.replace(/TEMPLATE_OBJ_REST_INITIALIZATION/g,rest_initialization );

//		console.log( routeImports.join('\n') );
    let app_routing_module_ts_content = responses.app_routing_module_ts.replace(/ROUTE_IMPORT_CLASES/g,routeImports.join('\n'))
		.replace(/ROUTES_DECLARATION/g,routes.join(','))


	filesPromises.push( fs.writeFile('./dist/angular/services/rest.service.ts', rest_file_content ) );
	filesPromises.push( fs.writeFile('./dist/angular/models/RestModels.ts', models_file_string ) );
	filesPromises.push( fs.writeFile('./dist/angular/app-routing.module.ts',app_routing_module_ts_content ) );

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


function replace_template(template,duplas)
{
	let result = '';//template.replace(duplas.search,duplas.replacement);
	console.log( template );
	console.log( duplas );

	duplas.forEach((i,index)=>
	{
		let search = i[0];
		let replacement = i[1];

		let str = index == 0 ? template : result;
		if( str == undefined || str == null)
		{
			console.log('STR IS NULL OR UNDEFINDED');
			return;
		}
		console.log('str is', str );
		result = str.replace( search, replacement );
	});
	return result;
}
