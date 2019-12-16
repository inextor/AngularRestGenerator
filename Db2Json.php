<?php
namespace AngularRestGenerator;

include_once( __DIR__.'/app.php' );
include_once( __DIR__.'/SuperRest.php');

use \akou\Utils;
use \akou\DBTable;
use \akou\RestController;


app::connect();

$database_name	= 'centrosmedicos';
$tables			= DBTable::getArrayFromQuery('SHOW TABLES');
$database_info	= array();

foreach($tables as $table)
{
	$name = $table['Tables_in_'.$database_name ];
	$constraints		= getJsonDBStructure($database_name,$name);
	$fields_info		= DBTable::getArrayFromQuery('DESCRIBE `'.$name.'`;');
	$database_info[$name]	= array( 'contraints'=>$constraints, 'fields'=>$fields_info);
}

echo json_encode( $database_info );


function getJsonDBStructure($database_name,$table_name)
{
	$sql_constraints = 'SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE CONSTRAINT_SCHEMA="'.$database_name.'" AND TABLE_NAME="'.$table_name.'" AND REFERENCED_COLUMN_NAME IS NOT NULL';
	return DBTable::getArrayFromQuery( $sql_constraints );
}


