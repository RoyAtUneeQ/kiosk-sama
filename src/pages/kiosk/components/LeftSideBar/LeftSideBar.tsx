import './LeftSideBar.scss';
import React, { useEffect, useState } from 'react';
import { CircleButton } from '@/components/button/Button';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { FaRegFaceLaughWink } from "react-icons/fa6";
import { FaAngellist } from "react-icons/fa";
import { AiOutlinePicture } from "react-icons/ai";
import { type Uneeq } from '@/types/Uneeq.d';
import { EmotionInstructionGenerator, ActionInstructionGenerator, ImageInstructionGenerator } from '@/utils';
  
type LeftSideBarProps = { uneeq: Uneeq | null };

const LeftSideBar: React.FC<LeftSideBarProps> = ({ uneeq }) => {
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
        <CircleButton icon={<FaPlus />} onClick={() => {
          handleCameraAnchorDistanceChange("up")
        }} />
        <CircleButton icon={<FaMinus />} onClick={() => {
          handleCameraAnchorDistanceChange("down")
        }} />
        <CircleButton icon={<FaRegFaceLaughWink />} onClick={() => {
          setCameraAnchorDistance("close_up")
          uneeq.chatPrompt(new EmotionInstructionGenerator().generate())
        }} />
        <CircleButton icon={<FaAngellist />} onClick={() => {
          setCameraAnchorDistance("full_shot")
          uneeq.chatPrompt(new ActionInstructionGenerator().generate())
        }} />
        <CircleButton icon={<AiOutlinePicture />} onClick={async () => {
          setCameraAnchorDistance("full_shot")
          uneeq.chatPrompt(await new ImageInstructionGenerator().generate())
        }} />
    </div>)
};

export default LeftSideBar; 