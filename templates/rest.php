<?php
namespace DATABASE_NAME_UPPERCASE;

include_once( __DIR__.'/app.php' );
include_once( __DIR__.'/akou/src/ArrayUtils.php');
include_once( __DIR__.'/SuperRest.php');

use \akou\Utils;
use \akou\DBTable;
use \akou\RestController;
use \akou\ArrayUtils;
use \akou\ValidationException;
use \akou\LoggableException;


class Service extends SuperRest
{
	function get()
	{
		session_start();
		App::connect();
		$this->setAllowHeader();

		if( isset( $_GET['id'] ) && !empty( $_GET['id'] ) )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::get( $_GET['id']  );

			if( ${{TABLE_NAME}} )
			{
				return $this->sendStatus( 200 )->json( ${{TABLE_NAME}}->toArray() );
			}
			return $this->sendStatus( 404 )->json(array('error'=>'The element wasn\'t found'));
		}


		$constraints = $this->getAllConstraints( {{TABLE_NAME}}::getAllProperties() );

		$constraints_str = count( $constraints ) > 0 ? join(' AND ',$constraints ) : '1';
		$pagination	= $this->getPagination();

		$sql_{{TABLE_NAME}}s	= 'SELECT SQL_CALC_FOUND_ROWS {{TABLE_NAME}}.*
			FROM `{{TABLE_NAME}}`
			WHERE '.$constraints_str.'
			LIMIT '.$pagination->limit.'
			OFFSET '.$pagination->offset;
		$info	= DBTable::getArrayFromQuery( $sql_{{TABLE_NAME}}s );
		$total	= DBTable::getTotalRows();
		return $this->sendStatus( 200 )->json(array("total"=>$total,"data"=>$info));
	}
	function post()
	{
		$this->setAllowHeader();
		$params = $this->getMethodParams();
		app::connect();
		DBTable::autocommit(false );

		try
		{
			$is_assoc	= $this->isAssociativeArray( $params );
			$result		= $this->batchInsert( $is_assoc  ? array($params) : $params );
			DBTable::commit();
			return $this->sendStatus( 200 )->json( $is_assoc ? $result[0] : $result );
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

	function put()
	{
		$this->setAllowHeader();
		$params = $this->getMethodParams();
		app::connect();
		DBTable::autocommit( false );

		try
		{
			$is_assoc	= $this->isAssociativeArray( $params );
			$result		= $this->batchUpdate( $is_assoc  ? array($params) : $params );
			DBTable::commit();
			return $this->sendStatus( 200 )->json( $is_assoc ? $result[0] : $result );
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


	function batchInsert($array)
	{
		$results = array();

		foreach($array as $params )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::createFromArray( $params );

			if( !${{TABLE_NAME}}->insert() )
			{
					throw new ValidationException('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
			}

			$results [] = ${{TABLE_NAME}}->toArray();
		}

		return $results;
	}

	function batchUpdate($array)
	{
		$results = array();

		foreach($array as $params )
		{
			${{TABLE_NAME}} = {{TABLE_NAME}}::createFromArray( $params );

			if( !empty( ${{TABLE_NAME}}->id ) )
			{
				${{TABLE_NAME}}->setWhereString( true );

				$properties = {{TABLE_NAME}}::getAllPropertiesExcept('created','updated');
				${{TABLE_NAME}}->unsetEmptyValues( DBTable::UNSET_ALL );

				if( !${{TABLE_NAME}}->updateDb( $properties ) )
				{
					throw new ValidationException('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
				}

				${{TABLE_NAME}}->load(true);

				$results [] = ${{TABLE_NAME}}->toArray();
			}
			else
			{
				if( !${{TABLE_NAME}}->insert() )
				{
					throw new ValidationException('An error Ocurred please try again later',${{TABLE_NAME}}->_conn->error );
				}

				$results [] = ${{TABLE_NAME}}->toArray();
			}
		}

		return $results;
	}

	/*
	function delete()
	{
		try
		{
			app::connect();
			DBTable::autocommit( false );

			if( empty( $_GET['id'] ) )
			{
				${{TABLE_NAME}} = new {{TABLE_NAME}}();
				${{TABLE_NAME}}->id = $_GET['id'];

				if( !${{TABLE_NAME}}->load(true) )
				{
					throw new NotFoundException('The element was not found');
				}

				if( !${{TABLE_NAME}}->deleteDb() )
				{
					throw new SystemException('An error occourred, please try again later');
				}

			}
			DBTable::commit();
			return $this->sendStatus( 200 )->json( ${{TABLE_NAME}}->toArray() );
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
	*/
}
$l = new Service();
$l->execute();
