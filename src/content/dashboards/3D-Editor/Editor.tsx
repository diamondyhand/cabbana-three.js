import {useEffect} from "react";
import {SceneViewer} from "./Three-Viewer-Class";

const Editor = () => {

    useEffect(()=>{
        //Set up a new scene in the canvas
       new SceneViewer()

        return () => {
            //Clean up the function
        }

    },[])


    return (
        <canvas id="cabbana-canvas" className={'editor-canvas'}></canvas>
        )
}
export default Editor;