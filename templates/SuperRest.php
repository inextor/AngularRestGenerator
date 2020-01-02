<?php
namespace CENTRO_MEDICO;

include_once( __DIR__.'/app.php' );
include_once( __DIR__.'/akou/src/ArrayUtils.php');

use \akou\Utils;
use \akou\DBTable;
use \akou\RestController;
use \akou\ArrayUtils;

class SuperRest extends \akou\RestController
{
	function options()
	{
		$this->setAllowHeader();
		return $this->defaultOptions();
	}

	function getPagination()
	{
		$page = 0;

		if( !empty( $_GET['page'] ) )
			$page = intval( $_GET['page'] );

		$page_size = 20;

		if( !empty( $_GET['limit'] ) )
			$page_size =  intval( $_GET['limit'] );


		return	$this->getPaginationInfo($page,$page_size,20);
	}
	function getEqualConstraints($array,$table_name='')
	{
		$constraints = [];
		foreach( $array as $index )
		{
			if( isset( $_GET[$index] ) && $_GET[$index] !== '' )
				$constraints[] =($table_name?$table_name.'.':''). $index.'="'.DBTable::escape( $_GET[ $index ]).'"';
		}
		return $constraints;
	}

	function getStartLikeConstraints( $array, $table_name)
	{
		error_log( json_encode(array_keys( $_GET )) );
		$constraints = array();

		foreach( $array as $index )
		{
			error_log( $index.'^' );
			if( isset( $_GET[$index.'^'] ) && $_GET[$index.'^'] !== '' )
			{
				$constraints[] = ($table_name?$table_name.'.':'').$index.' LIKE "'.DBTable::escape($_GET[ $index.'^' ]).'%"';
			}
		}
		if( count( $constraints ) )
			return array( "(".join(' OR ',$constraints ).")" );
		return array();
	}
	function getLikeConstraints($array,$table_name='')
	{
		$constraints = [];
		foreach( $array as $index )
		{
			if( isset( $_GET[$index.'~~'] ) && $_GET[$index.'~~'] !== '' )
			{
				$constraints[] = ($table_name?$table_name.'.':'').$index.' LIKE "%'.DBTable::escape($_GET[ $index.'~~' ]).'%"';
			}
		}
		if( count( $constraints ) )
			return array( "(".join(' OR ',$constraints ).")" );
		return array();
	}

	function getBiggerOrEqualThanConstraints( $array, $table_name )
	{
		$constraints = [];

		//error_log( 'KEYS'.join(',',array_keys( $_GET )) );
		foreach( $array as $index )
		{
			//error_log('Index'.$index.'>~ = '.$_GET[$index.'>~'] );
			if( isset( $_GET[$index.'>~'] ) && $_GET[$index.'>~'] !== '' )
			{
				error_log("YEP");
				$constraints[] = ($table_name?$table_name.'.':'').$index.' >= "'.DBTable::escape( $_GET[ $index.'>~' ]).'"';
			}
		}


		return $constraints;
	}
	function getBiggerThanConstraints($array ,$table_name='')
	{
		$constraints = [];

		//error_log( 'KEYS'.join(',',array_keys( $_GET )) );
		foreach( $array as $index )
		{
			//error_log('Index'.$index.'>~ = '.$_GET[$index.'>~'] );
			if( isset( $_GET[$index.'>'] ) && $_GET[$index.'>'] !== '' )
			{
				$constraints[] = ($table_name?$table_name.'.':'').$index.' > "'.DBTable::escape( $_GET[ $index.'>' ]).'"';
			}
		}
		return $constraints;
	}

	function getSmallestThanConstraints($array,$table_name='')
	{
		$constraints = [];
		foreach( $array as $index )
		{
			if( isset( $_GET[$index.'<~'] ) && $_GET[$index.'<~'] !== '' )
				$constraints[] = ($table_name?$table_name.'.':'').$index.' < "'.DBTable::escape( $_GET[ $index.'<~' ]).'"';
		}
		return $constraints;
	}

	function getCsvConstraints($array,$table_name='')
	{
		$constraints = [];
		foreach( $array as $index )
		{
			if( isset( $_GET[$index.','] ) && $_GET[$index.','] !== '' )
				$constraints[] = ($table_name?$table_name.'.':'').$index.' IN  ('.DBTable::escapeCSV( $_GET[ $index.',' ]).')';
		}
		return $constraints;
	}

	function getAllConstraints($key_constraints,$table_name='')
	{
		$like_constraints = $this->getLikeConstraints( $key_constraints, $table_name );
		$equal_constrints = $this->getEqualConstraints( $key_constraints, $table_name );
		$bigger_than_constraints = $this->getBiggerThanConstraints( $key_constraints, $table_name );
		$ge_constraints = $this->getBiggerOrEqualThanConstraints( $key_constraints, $table_name );
		$smallest_than_constraints = $this->getSmallestThanConstraints( $key_constraints, $table_name );
		$csv_constraints	= $this->getCsvConstraints( $key_constraints, $table_name );
		$start_constraints			= $this->getStartLikeConstraints( $key_constraints, $table_name );
		return array_merge( $like_constraints, $equal_constrints, $ge_constraints, $smallest_than_constraints, $csv_constraints,$start_constraints );
	}

	function getSessionErrors($usuario,$roles = NULL )
	{
		if(empty( $usuario_session ))
		{
			return $this->sendStatus( 401 )->json(array('error'=>'Por favor inicia sesion'));
		}

		if( $roles !== NULL && !in_array( $usuario->tipo, $roles) )
		{
			return $this->sendStatus( 403 )->json(array('error'=>'Permiso denegado se necesita alguno de los siguientes permisos '.join(',', $roles)));
		}
		return NULL;
	}
	function isAssociativeArray(array $array)
	{
  		return count(array_filter(array_keys($array), 'is_string')) > 0;
	}
}
