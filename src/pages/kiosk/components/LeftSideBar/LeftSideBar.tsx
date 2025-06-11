import './LeftSideBar.scss';
import React, { useEffect, useState } from 'react';
import { CircleButton } from '@/components/button/Button';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { FaRegFaceLaughWink } from "react-icons/fa6";
import { FaAngellist } from "react-icons/fa";
import { AiOutlinePicture } from "react-icons/ai";
import { type Uneeq } from '@/types/Uneeq.d';
import { PiSealQuestionFill } from "react-icons/pi";
import { EmotionInstructionGenerator, ActionInstructionGenerator, ImageInstructionGenerator, TutorialInstructionGenerator } from '@/instructions';
import { useTranslation } from '@/hooks';
import { useConfig } from '@/hooks/useConfig';
import { BsHourglassSplit } from "react-icons/bs";

type LeftSideBarProps = { isLoading: boolean, uneeq: Uneeq | null, highlight: string | null, onButtonClick: (button: string) => void, promptCallback: (prompt: string) => void, setHighlight: (highlight: string | null) => void};

const LeftSideBar: React.FC<LeftSideBarProps> = ({ isLoading, uneeq, highlight, onButtonClick, promptCallback, setHighlight }) => {
  const { t } = useTranslation();
  const { config } = useConfig(); 
  if (!uneeq) return null;

  const cameraAnchorDistanceOptions = [
    "close_up",
    "loose_close_up",
    "tight_medium_shot",
    "medium_shot",
    "medium_full_shot",
    "full_shot"
  ]

  const [cameraAnchorDistance, setCameraAnchorDistance] = useState("full_shot");

  useEffect(() => {
    uneeq.cameraAnchorDistance(cameraAnchorDistance, 1000)
    setTimeout(() => {
      setHighlight(null);
    }, 1000);
  }, [cameraAnchorDistance])

  const handleCameraAnchorDistanceChange = (direction: "up" | "down") => {
    const currentIndex = cameraAnchorDistanceOptions.indexOf(cameraAnchorDistance);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < cameraAnchorDistanceOptions.length) {
      setCameraAnchorDistance(cameraAnchorDistanceOptions[newIndex]);
    }
  };

  return (
    <div className="left-side-bar-buttons-container">
        <CircleButton 
          className="highlight"
          style={{ visibility: isLoading ? "visible" : "hidden"  }}
          icon={<BsHourglassSplit />}  
          draggable={false} 
          aria-label={t('accessibility.chat')}
        />
        <CircleButton 
          className={highlight === "zoom_in_button" ? "highlight" : ""} 
          icon={<FaPlus />}  
          draggable={false} 
          onClick={() => {
            uneeq.stopSpeaking()
            onButtonClick("zoom_in_button")
            handleCameraAnchorDistanceChange("up")
          }}
          aria-label={t('accessibility.zoomIn')}
        />
        <CircleButton 
          className={highlight === "zoom_out_button" ? "highlight" : ""} 
          icon={<FaMinus />}  
          draggable={false} 
          onClick={() => {
            uneeq.stopSpeaking()
            onButtonClick("zoom_out_button")
            handleCameraAnchorDistanceChange("down")
          }}
          aria-label={t('accessibility.zoomOut')}
        />
        <CircleButton 
          className={highlight === "emotion_button" ? "highlight" : ""} 
          icon={<FaRegFaceLaughWink />} 
          draggable={false} 
          onClick={() => {
            uneeq.stopSpeaking()
            onButtonClick("emotion_button")
            setCameraAnchorDistance("close_up")
            promptCallback(new EmotionInstructionGenerator().generate())
          }}
          aria-label={t('accessibility.emotion')}
        />
        <CircleButton 
          className={highlight === "action_button" ? "highlight" : ""} 
          icon={<FaAngellist />} 
          draggable={false} 
          onClick={() => {
            uneeq.stopSpeaking()
            onButtonClick("action_button")
            setCameraAnchorDistance("full_shot")
            promptCallback(new ActionInstructionGenerator().generate())
          }}
          aria-label={t('accessibility.action')}
        />
        <CircleButton 
          className={highlight === "image_button" ? "highlight" : ""} 
          icon={<AiOutlinePicture />} 
          draggable={false} 
          onClick={async () => {
            uneeq.stopSpeaking()
            setCameraAnchorDistance("full_shot")
            onButtonClick("image_button")
            promptCallback(await new ImageInstructionGenerator(config.apis.pixabay.api_key, config.apis.pixabay.api_url).generate())
          }}
          aria-label={t('accessibility.image')}
        />
        <CircleButton 
          className={highlight === "tutorial_button" ? "highlight" : ""} 
          icon={<PiSealQuestionFill />} 
          draggable={false} 
          onClick={() => {
            uneeq.stopSpeaking()
            onButtonClick("tutorial_button")
            promptCallback(new TutorialInstructionGenerator().generate())
          }}
          aria-label={t('accessibility.tutorial')}
        />
    </div>)
};

export default LeftSideBar; 