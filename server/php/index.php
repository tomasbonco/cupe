<?php

// Action
upload_image( $_POST['cupe'] );


/**
 * Generates name and saves the image.
 *
 * @param {string} input - image input as string
 * @param {string} directory - directory to be uploaded images
 * @return {string} generated filename ( directory + name + .png )
 */
function upload_image( $input, $directory = "" )
{
	// Split 'png/base64' header, from the content of file
    $part = explode(',', $input);
	
	// Base64 doesn't support comma, so they have to be 2 parts after splitting by comma
    if ( count($part) === 2 )
    {
		// Create image from string
        $string = base64_decode( $part[1] );
        $im = @imagecreatefromstring( $string );
		
		// Generate new filename
        $name = md5( microtime() );
 
 		// Preserve aplha, if possible
        imagealphablending( $im, FALSE );
        imagesavealpha( $im, TRUE );
		
        if ( $im !== FALSE )
        {
            if ( strpos( $part[0], 'png' ) )
            {
				// Saves file
                $filename = $directory . $name . '.png';
                imagepng( $im, $filename );
            }
		    
            imagedestroy( $im );
		    
            return $filename;
        }
    }
}