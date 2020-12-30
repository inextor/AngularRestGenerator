<?php
namespace APP;

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
		$constraints = array();

		foreach( $array as $index )
		{
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

		foreach( $array as $index )
		{
			if( isset( $_GET[$index.'>~'] ) && $_GET[$index.'>~'] !== '' )
			{
				$constraints[] = ($table_name?$table_name.'.':'').$index.' >= "'.DBTable::escape( $_GET[ $index.'>~' ]).'"';
			}
		}


		return $constraints;
	}
	function getBiggerThanConstraints($array ,$table_name='')
	{
		$constraints = [];

		foreach( $array as $index )
		{
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
			if( isset( $_GET[$index.'<'] ) && $_GET[$index.'<'] !== '' )
				$constraints[] = ($table_name?$table_name.'.':'').$index.' < "'.DBTable::escape( $_GET[ $index.'<' ]).'"';
		}
		return $constraints;
	}
	function getSmallestOrEqualThanConstraints($array,$table_name='')
	{
		$constraints = [];
		foreach( $array as $index )
		{
			if( isset( $_GET[$index.'<~'] ) && $_GET[$index.'<~'] !== '' )
				$constraints[] = ($table_name?$table_name.'.':'').$index.' <= "'.DBTable::escape( $_GET[ $index.'<~' ]).'"';
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
		$le_than_constraints = $this->getSmallestOrEqualThanConstraints( $key_constraints, $table_name );
		$csv_constraints	= $this->getCsvConstraints( $key_constraints, $table_name );
		$start_constraints			= $this->getStartLikeConstraints( $key_constraints, $table_name );
		return array_merge( $like_constraints, $equal_constrints, $ge_constraints, $smallest_than_constraints,$le_than_constraints,$csv_constraints,$start_constraints );
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

	function debug($label, $array, $json=TRUE)
	{
		if( $json )
			error_log( $label.' '.json_encode( $array, JSON_PRETTY_PRINT ));
		else
		error_log( $label.' '.print_r( $array, true ) );
	}

	function debugArray($label, $array,$json=TRUE )
	{
		return $this->debug($label,$array,$json);
	}

	function saveReplay()
	{
		$replay				= new replay();
		$replay->url		= $_SERVER['REQUEST_URI'];
		$replay->method		= $_SERVER['REQUEST_METHOD'];

		$replay->get_params	= json_encode( $_GET );
		$replay->post_params = json_encode( $this->getMethodParams() );
		$replay->headers	= json_encode( getallheaders() );

		if( !$replay->insert() )
		{

		}
	}

	function genericGet($table_name)
	{
		$class_name = "APP\\$table_name";

		if( isset( $_GET['id'] ) && !empty( $_GET['id'] ) )
		{
			$obj_inst = $class_name::get( $_GET['id']  );

			if( $obj_inst )
			{
				return $this->sendStatus( 200 )->json( $obj_inst->toArray() );
			}
			return $this->sendStatus( 404 )->json(array('error'=>'The element wasn\'t found'));
		}

		$constraints = $this->getAllConstraints( $class_name::getAllProperties() );

		$constraints_str = count( $constraints ) > 0 ? join(' AND ',$constraints ) : '1';
		$pagination	= $this->getPagination();

		$sql	= 'SELECT SQL_CALC_FOUND_ROWS `'.$table_name.'`.*
			FROM `'.$table_name.'`
			WHERE '.$constraints_str.'
			LIMIT '.$pagination->limit.'
			OFFSET '.$pagination->offset;

		$info	= DBTable::getArrayFromQuery( $sql );
		$total	= DBTable::getTotalRows();
		return $this->sendStatus( 200 )->json(array("total"=>$total,"data"=>$info));
	}

	function genericInsert($array, $table_name)
	{
		$class_name = "APP\\$table_name";
		$results = array();

		$user = app::getUserFromSession();

		foreach($array as $params )
		{
			$except = array('id','created','updated','tiempo_creacion','tiempo_actualizacion','updated_by_user_id','created_by_user_id');
			$properties = $class_name::getAllPropertiesExcept( $except );

			$obj_inst = new $class_name;
			$obj_inst->assignFromArray( $params, $properties );
			$obj_inst->unsetEmptyValues( DBTable::UNSET_BLANKS );

			if( $user )
			{
				$user_array = array('updated_by_user_id'=>$user->id,'created_by_user_id'=>$user->id);
				$obj_inst->assignFromArray( $user_array );
			}

			if( !$obj_inst->insert() )
			{
					throw new ValidationException('An error Ocurred please try again later',$obj_inst->_conn->error );
			}

			$results [] = $obj_inst->toArray();
		}

		return $results;

	}

	function genericUpdate($array, $table_name, $insert_with_ids)
	{
		$class_name = "APP\\$table_name";

		$results = array();
		$user = app::getUserFromSession();

		foreach($array as $index=>$params )
		{
			$except = array('id','created','updated','tiempo_creacion','tiempo_actualizacion','updated_by_user_id','created_by_user_id');
			$properties = $class_name::getAllPropertiesExcept( $except );

			$obj_inst = $class_name::createFromArray( $params );

			if( $insert_with_ids )
			{
				if( !empty( $obj_inst->id ) )
				{
					if( $obj_inst->load(true) )
					{
						$obj_inst->assignFromArray( $params, $properties );
						$obj_inst->unsetEmptyValues( DBTable::UNSET_BLANKS );


						if( $user )
						{
							$user_array = array('updated_by_user_id'=>$user->id);
							$obj_inst->assignFromArray( $user_array );
						}

						if( !$obj_inst->update($properties) )
						{
							throw new ValidationException('It fails to update element #'.$obj_inst->id);
						}
					}
					else
					{
						if( $user )
						{
							$user_array = array('updated_by_user_id'=>$user->id,'created_by_user_id'=>$user->id);
							$obj_inst->assignFromArray( $user_array );
						}

						if( !$obj_inst->insertDb() )
						{
							throw new ValidationException('It fails to update element at index #'.$index);
						}
					}
				}
			}
			else
			{
				if( !empty( $obj_inst->id ) )
				{
					$obj_inst->setWhereString( true );

					$except = array('id','created','updated','tiempo_creacion','tiempo_actualizacion','updated_by_user_id','created_by_user_id');
					$properties = $class_name::getAllPropertiesExcept( $except );
					$obj_inst->unsetEmptyValues( DBTable::UNSET_BLANKS );

					if( $user )
					{
						$user_array = array('updated_by_user_id'=>$user->id);
						$obj_inst->assignFromArray( $user_array );
					}

					if( !$obj_inst->updateDb( $properties ) )
					{
						throw new ValidationException('An error Ocurred please try again later',$obj_inst->_conn->error );
					}

					$obj_inst->load(true);

					$results [] = $obj_inst->toArray();
				}
				else
				{
					if( $user )
					{
						$user_array = array('updated_by_user_id'=>$user->id,'created_by_user_id'=>$user->id);
						$obj_inst->assignFromArray( $user_array );
					}

					$obj_inst->unsetEmptyValues( DBTable::UNSET_BLANKS );
					if( !$obj_inst->insert() )
					{
						throw new ValidationException('An error Ocurred please try again later',$obj_inst->_conn->error );
					}

					$results [] = $obj_inst->toArray();
				}
			}
		}

		return $results;
	}

	function genericDelete($table_name)
	{
		$class_name = "APP\\$class_name";
		try
		{
			app::connect();
			DBTable::autocommit( false );

			$user = app::getUserFromSession();

			if( $user == null )
				throw new ValidationException('Please login');

			if( empty( $_GET['id'] ) )
			{
				$obj_inst = new $class_name;
				$obj_inst->id = $_GET['id'];

				if( !$obj_inst->load(true) )
				{
					throw new NotFoundException('The element was not found');
				}

				if( !$obj_inst->deleteDb() )
				{
					throw new SystemException('An error occourred, please try again later');
				}

			}
			DBTable::commit();
			return $this->sendStatus( 200 )->json( $obj_inst->toArray() );
		}
		catch(LoggableException $e)
		{
			DBTable::rollback();
			return $this->sendStatus( $e->code )->json(array("error"=>$e->getMessage()));
		}
		catch(Exception $e)
		{
			DBTable::rollback();
			return $this->sendStatus( 500 )->json(array("error"=>$e->getMessage()));
		}
	}
}
