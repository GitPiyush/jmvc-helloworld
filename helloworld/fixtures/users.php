<?php

/**
 * This file fakes JSON server responses
 */

$output;
$users = array(
	array("name" => "john", "description" => "English dude from nowhere near london, does not drink tea", "id" => 5 ),
	array("name" => "luca", "description" => "English dude from actual london", "id" => 6 ),
	array("name" => "malcolm", "description" => "Warning DO NOT let this man near your computer!", "id" => 7 ),
	array("name" => "dowdy", "description" => "Likes to sleep in Mavericking sessions, Dowdy wake up!!", "id" => 8 ),
	array("name" => "emi", "description" => "Emi might actually be called Emi Fredricksen, we're checking with interpol", "id" => 9 ),
	array("name" => "waz", "description" => "Blackmailed me into doing mavericking. I want all the copies of those pictures Waz!", "id" => 10 )
);

// Multidimentional search
function multidimensional_search($parents, $searched) { 
  if (empty($searched) || empty($parents)) { 
    return false; 
  } 
  
  foreach ($parents as $key => $value) { 
    $exists = true; 
    foreach ($searched as $skey => $svalue) { 
      $exists = ($exists && IsSet($parents[$key][$skey]) && $parents[$key][$skey] == $svalue); 
    } 
    if($exists){ return $key; } 
  } 
  
  return false; 
}



if( isset($_GET['id']) && is_numeric($_GET['id']) ) {
	//check to see if we can return 
	
	$key = multidimensional_search($users, array( 'id' => (int)$_GET['id'] ));

	if ( $key !== false ) {
		$output = json_encode($users[ $key ]);
	}
	else {

		$output = json_encode(array( 'error' => "User does not exist" ));
	}
}

elseif( isset($_GET['name']) && !empty($_GET['name']) ) {
	$key = multidimensional_search($users, array( 'name' => (string)$_GET['name'] ));

	if ( $key !== false ) {
		$output = json_encode($users[ $key ]);
	}
	else {

		$output = json_encode(array( 'error' => "User does not exist" ));
	}
}

else{

	// return all as json
	$output = json_encode($users);
}

echo $output;
exit;
