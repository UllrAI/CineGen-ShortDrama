import React, { useState } from 'react';
import { Play, SkipForward, SkipBack, Loader2, Video, Image as ImageIcon, ArrowRight, LayoutGrid, Maximize2, Sparkles, AlertCircle, MapPin, User, Clock, ChevronLeft, ChevronRight, ArrowLeft, MessageSquare, X, Film, Aperture, Shirt } from 'lucide-react';
import { ProjectState, Shot, Keyframe } from '../types';
import { generateImage, generateVideo } from '../services/geminiService';

interface Props {
  project: ProjectState;
  updateProject: (updates: Partial<ProjectState>) => void;
}

const StageDirector: React.FC<Props> = ({ project, updateProject }) => {
  const [activeShotId, setActiveShotId] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<{id: string, type: 'kf_start'|'kf_end'|'video'}|null>(null);
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number, message: string} | null>(null);

  const activeShotIndex = project.shots.findIndex(s => s.id === activeShotId);
  const activeShot = project.shots[activeShotIndex];
  
  // Safe access to keyframes (may be undefined if data is incomplete)
  const startKf = activeShot?.keyframes?.find(k => k.type === 'start');
  const endKf = activeShot?.keyframes?.find(k => k.type === 'end');

  // Check if all start frames are generated
  const allStartFramesGenerated = project.shots.length > 0 && project.shots.every(s => s.keyframes?.find(k => k.type === 'start')?.imageUrl);

  const updateShot = (shotId: string, transform: (s: Shot) => Shot) => {
    const newShots = project.shots.map(s => s.id === shotId ? transform(s) : s);
    updateProject({ shots: newShots });
  };

  const getRefImagesForShot = (shot: Shot) => {
      const referenceImages: string[] = [];
      if (project.scriptData) {
        // 1. Scene Reference (Environment / Atmosphere) - PRIORITY
        const scene = project.scriptData.scenes.find(s => String(s.id) === String(shot.sceneId));
        if (scene?.referenceImage) {
          referenceImages.push(scene.referenceImage);
        }

        // 2. Character References (Appearance)
        if (shot.characters) {
          shot.characters.forEach(charId => {
            const char = project.scriptData?.characters.find(c => String(c.id) === String(charId));
            if (!char) return;

            // Check if a specific variation is selected for this shot
            const varId = shot.characterVariations?.[charId];
            if (varId) {
                const variation = char.variations?.find(v => v.id === varId);
                if (variation?.referenceImage) {
                    referenceImages.push(variation.referenceImage);
                    return; // Use variation image instead of base
                }
            }

            // Fallback to base image
            if (char.referenceImage) {
              referenceImages.push(char.referenceImage);
            }
          });
        }
      }
      return referenceImages;
  };

  const handleGenerateKeyframe = async (shot: Shot, type: 'start' | 'end') => {
    // Robustly handle missing keyframe object
    const existingKf = shot.keyframes?.find(k => k.type === type);
    const kfId = existingKf?.id || `kf-${shot.id}-${type}-${Date.now()}`;
    const prompt = existingKf?.visualPrompt || shot.actionSummary;
    
    setProcessingState({ id: kfId, type: type === 'start' ? 'kf_start' : 'kf_end' });
    
    try {
      const referenceImages = getRefImagesForShot(shot);
      const url = await generateImage(prompt, referenceImages);

      updateProject({ 
        shots: project.shots.map(s => {
           if (s.id !== shot.id) return s;
           
           const newKeyframes = [...(s.keyframes || [])];
           const idx = newKeyframes.findIndex(k => k.type === type);
           const newKf: Keyframe = {
               id: kfId,
               type,
               visualPrompt: prompt,
               imageUrl: url,
               status: 'completed'
           };
           
           if (idx >= 0) {
               newKeyframes[idx] = newKf;
           } else {
               newKeyframes.push(newKf);
           }
           
           return { ...s, keyframes: newKeyframes };
        }) 
      });
    } catch (e: any) {
      console.error(e);
      alert(`生成失败: ${e.message}`);
    } finally {
      setProcessingState(null);
    }
  };

  const handleGenerateVideo = async (shot: Shot) => {
    const sKf = shot.keyframes?.find(k => k.type === 'start');
    const eKf = shot.keyframes?.find(k => k.type === 'end');

    if (!sKf?.imageUrl) return alert("请先生成起始帧！");

    // Backfill an interval for legacy projects saved before intervals were
    // initialized, so video generation works regardless of data vintage.
    const interval = shot.interval || {
      id: `int-${shot.id}`,
      startKeyframeId: sKf.id,
      endKeyframeId: eKf?.id || '',
      duration: 5,
      motionStrength: 5,
      status: 'pending' as const
    };

    // Default to Image-to-Video unless an End Frame is explicitly generated,
    // avoiding morphing artifacts from an auto-grabbed next-shot frame.
    const endImageUrl = eKf?.imageUrl;

    setProcessingState({ id: interval.id, type: 'video' });

    try {
      const videoUrl = await generateVideo(
          shot.actionSummary,
          sKf.imageUrl,
          endImageUrl // Only pass if it exists
      );

      updateShot(shot.id, (s) => ({
        ...s,
        interval: { ...(s.interval || interval), videoUrl, status: 'completed' }
      }));
    } catch (e: any) {
      console.error(e);
      alert(`视频生成失败: ${e.message}`);
    } finally {
      setProcessingState(null);
    }
  };

  const handleBatchGenerateImages = async () => {
      const isRegenerate = allStartFramesGenerated;
      
      let shotsToProcess = [];
      if (isRegenerate) {
          if (!window.confirm("确定要重新生成所有镜头的首帧吗？这将覆盖现有图片。")) return;
          shotsToProcess = [...project.shots];
      } else {
          // Process shots that don't have a start image URL (handles missing keyframe objects too)
          shotsToProcess = project.shots.filter(s => !s.keyframes?.find(k => k.type === 'start')?.imageUrl);
      }
      
      if (shotsToProcess.length === 0) return;

      setBatchProgress({ 
          current: 0, 
          total: shotsToProcess.length, 
          message: isRegenerate ? "正在重新生成所有首帧..." : "正在批量生成缺失的首帧..." 
      });

      let currentShots = [...project.shots];

      for (let i = 0; i < shotsToProcess.length; i++) {
          // Rate Limit Mitigation: 3s delay
          if (i > 0) await new Promise(r => setTimeout(r, 3000));

          const shot = shotsToProcess[i];
          setBatchProgress({ 
              current: i + 1, 
              total: shotsToProcess.length, 
              message: `正在生成镜头 ${i+1}/${shotsToProcess.length}...` 
          });
          
          try {
             const existingKf = shot.keyframes?.find(k => k.type === 'start');
             const prompt = existingKf?.visualPrompt || shot.actionSummary;
             const kfId = existingKf?.id || `kf-${shot.id}-start-${Date.now()}`;

             const referenceImages = getRefImagesForShot(shot);
             const url = await generateImage(prompt, referenceImages);

             currentShots = currentShots.map(s => {
                if (s.id !== shot.id) return s;
                
                const newKeyframes = [...(s.keyframes || [])];
                const idx = newKeyframes.findIndex(k => k.type === 'start');
                const newKf: Keyframe = {
                    id: kfId,
                    type: 'start',
                    visualPrompt: prompt,
                    imageUrl: url,
                    status: 'completed'
                };

                if (idx >= 0) newKeyframes[idx] = newKf;
                else newKeyframes.push(newKf);

                return { ...s, keyframes: newKeyframes };
             });

             updateProject({ shots: currentShots });

          } catch (e) {
             console.error(`Failed to generate for shot ${shot.id}`, e);
          }
      }

      setBatchProgress(null);
  };

  const handleVariationChange = (shotId: string, charId: string, varId: string) => {
     updateShot(shotId, (s) => ({
         ...s,
         characterVariations: {
             ...(s.characterVariations || {}),
             [charId]: varId
         }
     }));
  };

  const goToPrevShot = () => {
    if (activeShotIndex > 0) {
      setActiveShotId(project.shots[activeShotIndex - 1].id);
    }
  };

  const goToNextShot = () => {
    if (activeShotIndex < project.shots.length - 1) {
      setActiveShotId(project.shots[activeShotIndex + 1].id);
    }
  };

  const renderSceneContext = () => {
      if (!activeShot || !project.scriptData) return null;
      // String comparison for safety
      const scene = project.scriptData.scenes.find(s => String(s.id) === String(activeShot.sceneId));
      const activeCharacters = project.scriptData.characters.filter(c => activeShot.characters.includes(c.id));

      return (
          <div className="bg-[#141414] p-5 rounded-xl border border-zinc-800 mb-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <MapPin className="w-4 h-4 text-zinc-500" />
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">场景环境 (Scene Context)</h4>
              </div>
              
              <div className="flex gap-4">
                  <div className="w-28 h-20 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-700 relative">
                    {scene?.referenceImage ? (
                      <img src={scene.referenceImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                          <MapPin className="w-6 h-6 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-white text-sm font-bold">{scene?.location || '未知场景'}</span>
                        <span className="text-sm px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {scene?.time}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2">{scene?.atmosphere}</p>
                    
                    {/* Character List with Variation Selector */}
                    <div className="flex flex-col gap-2 pt-2">
                         {activeCharacters.map(char => {
                             const hasVars = char.variations && char.variations.length > 0;
                             return (
                                 <div key={char.id} className="flex items-center justify-between bg-zinc-900 rounded p-1.5 border border-zinc-800">
                                     <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 rounded-full bg-zinc-700 overflow-hidden">
                                             {char.referenceImage && <img src={char.referenceImage} className="w-full h-full object-cover" />}
                                         </div>
                                         <span className="text-[11px] text-zinc-300 font-medium">{char.name}</span>
                                     </div>
                                     
                                     {hasVars && (
                                         <select 
                                            value={activeShot.characterVariations?.[char.id] || ""}
                                            onChange={(e) => handleVariationChange(activeShot.id, char.id, e.target.value)}
                                            className="bg-black text-[10px] text-zinc-400 border border-zinc-700 rounded px-1.5 py-0.5 max-w-[100px] outline-none focus:border-indigo-500"
                                         >
                                             <option value="">Default Look</option>
                                             {char.variations.map(v => (
                                                 <option key={v.id} value={v.id}>{v.name}</option>
                                             ))}
                                         </select>
                                     )}
                                 </div>
                             );
                         })}
                    </div>
                  </div>
              </div>
          </div>
      );
  };

  if (!project.shots.length) return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-[#121212]">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50"/>
          <p>暂无镜头数据，请先返回阶段 1 生成分镜表。</p>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#121212] relative overflow-hidden">
      
      {/* Batch Progress Overlay */}
      {batchProgress && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in">
           <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
           <h3 className="text-xl font-bold text-white mb-2">{batchProgress.message}</h3>
           <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
           </div>
           <p className="text-zinc-500 mt-3 text-xs font-mono">{Math.round((batchProgress.current / batchProgress.total) * 100)}%</p>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-16 border-b border-zinc-800 bg-[#1A1A1A] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-indigo-500" />
                  导演工作台
                  <span className="text-xs text-zinc-600 font-mono font-normal uppercase tracking-wider bg-black/30 px-2 py-1 rounded">Director Workbench</span>
              </h2>
          </div>

          <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 mr-4 font-mono">
                  {project.shots.filter(s => s.interval?.videoUrl).length} / {project.shots.length} 完成
              </span>
              <button 
                  onClick={handleBatchGenerateImages}
                  disabled={!!batchProgress}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                      allStartFramesGenerated
                        ? 'bg-[#141414] text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500'
                        : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5'
                  }`}
              >
                  <Sparkles className="w-3 h-3" />
                  {allStartFramesGenerated ? '重新生成所有首帧' : '批量生成首帧'}
              </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
          
          {/* Grid View - Responsive Logic */}
          <div className={`flex-1 overflow-y-auto p-6 transition-all duration-500 ease-in-out ${activeShotId ? 'border-r border-zinc-800' : ''}`}>
              <div className={`grid gap-4 ${activeShotId ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                  {project.shots.map((shot, idx) => {
                      const sKf = shot.keyframes?.find(k => k.type === 'start');
                      const hasImage = !!sKf?.imageUrl;
                      const hasVideo = !!shot.interval?.videoUrl;
                      const isActive = activeShotId === shot.id;

                      return (
                          <div 
                              key={shot.id}
                              onClick={() => setActiveShotId(shot.id)}
                              className={`
                                  group relative flex flex-col bg-[#1A1A1A] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200
                                  ${isActive ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-xl scale-[0.98]' : 'border-zinc-800 hover:border-zinc-600 hover:shadow-lg'}
                              `}
                          >
                              {/* Header */}
                              <div className="px-3 py-2 bg-[#151515] border-b border-zinc-800 flex justify-between items-center">
                                  <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`}>SHOT {String(idx + 1).padStart(2, '0')}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded uppercase">{shot.cameraMovement}</span>
                              </div>

                              {/* Thumbnail */}
                              <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                                  {hasImage ? (
                                      <img src={sKf!.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                                          <ImageIcon className="w-8 h-8 opacity-20" />
                                      </div>
                                  )}
                                  
                                  {/* Badges */}
                                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                      {hasVideo && <div className="p-1 bg-green-500 text-white rounded shadow-lg backdrop-blur"><Video className="w-3 h-3" /></div>}
                                  </div>

                                  {!activeShotId && !hasImage && (
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <span className="text-[10px] text-white font-bold uppercase tracking-wider bg-zinc-900/90 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur">点击生成</span>
                                      </div>
                                  )}
                              </div>

                              {/* Footer */}
                              <div className="p-3">
                                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                      {shot.actionSummary}
                                  </p>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          {/* Right Workbench - Optimized Interaction */}
          {activeShotId && activeShot && (
              <div className="w-[480px] bg-[#0F0F0F] flex flex-col h-full shadow-2xl animate-in slide-in-from-right-10 duration-300 relative z-20">
                  
                  {/* Workbench Header */}
                  <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-[#141414] shrink-0">
                       <div className="flex items-center gap-3">
                           <span className="w-8 h-8 bg-indigo-900/30 text-indigo-400 rounded-lg flex items-center justify-center font-bold font-mono text-sm border border-indigo-500/20">
                              {String(activeShotIndex + 1).padStart(2, '0')}
                           </span>
                           <div>
                               <h3 className="text-white font-bold text-sm">镜头详情</h3>
                               <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{activeShot.cameraMovement}</p>
                           </div>
                       </div>
                       
                       <div className="flex items-center gap-1">
                           <button onClick={goToPrevShot} disabled={activeShotIndex === 0} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white disabled:opacity-20 transition-colors">
                               <ChevronLeft className="w-4 h-4" />
                           </button>
                           <button onClick={goToNextShot} disabled={activeShotIndex === project.shots.length - 1} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white disabled:opacity-20 transition-colors">
                               <ChevronRight className="w-4 h-4" />
                           </button>
                           <div className="w-px h-4 bg-zinc-700 mx-2"></div>
                           <button onClick={() => setActiveShotId(null)} className="p-2 hover:bg-red-900/20 rounded text-zinc-400 hover:text-red-400 transition-colors">
                               <X className="w-4 h-4" />
                           </button>
                       </div>
                  </div>

                  {/* Workbench Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                       
                       {/* Section 1: Context */}
                       {renderSceneContext()}

                       {/* Section 2: Narrative */}
                       <div className="space-y-4">
                           <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                               <Film className="w-4 h-4 text-zinc-500" />
                               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">叙事动作 (Action & Dialogue)</h4>
                           </div>
                           
                           <div className="space-y-3">
                               <div className="bg-[#141414] p-4 rounded-lg border border-zinc-800">
                                   <p className="text-zinc-200 text-sm leading-relaxed">{activeShot.actionSummary}</p>
                               </div>
                               
                               {activeShot.dialogue && (
                                  <div className="bg-[#141414] p-4 rounded-lg border border-zinc-800 flex gap-3">
                                      <MessageSquare className="w-4 h-4 text-zinc-600 mt-0.5" />
                                      <div>
                                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">对白</p>
                                          <p className="text-indigo-200 font-serif italic text-sm">"{activeShot.dialogue}"</p>
                                      </div>
                                  </div>
                               )}
                           </div>
                       </div>

                       {/* Section 3: Visual Production */}
                       <div className="space-y-4">
                           <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                               <Aperture className="w-4 h-4 text-zinc-500" />
                               <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">视觉制作 (Visual Production)</h4>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                               {/* Start Frame */}
                               <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">起始帧 (Start)</span>
                                       <button 
                                           onClick={() => handleGenerateKeyframe(activeShot, 'start')}
                                           className="text-[10px] text-indigo-400 hover:text-white transition-colors"
                                       >
                                           {startKf?.imageUrl ? '重新生成' : '生成'}
                                       </button>
                                   </div>
                                   <div className="aspect-video bg-black rounded-lg border border-zinc-800 overflow-hidden relative group">
                                       {startKf?.imageUrl ? (
                                           <img src={startKf.imageUrl} className="w-full h-full object-contain cursor-pointer" onClick={() => window.open(startKf.imageUrl, '_blank')} />
                                       ) : (
                                           <div className="absolute inset-0 flex items-center justify-center">
                                               <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                                           </div>
                                       )}
                                       {/* Loading State matching ID */}
                                       {((startKf && processingState?.id === startKf.id) || (processingState?.type === 'kf_start' && !startKf)) && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                            </div>
                                       )}
                                   </div>
                               </div>

                               {/* End Frame */}
                               <div className="space-y-2">
                                   <div className="flex justify-between items-center">
                                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">结束帧 (End)</span>
                                       <button 
                                           onClick={() => handleGenerateKeyframe(activeShot, 'end')}
                                           className="text-[10px] text-indigo-400 hover:text-white transition-colors"
                                       >
                                           {endKf?.imageUrl ? '重新生成' : '生成'}
                                       </button>
                                   </div>
                                   <div className="aspect-video bg-black rounded-lg border border-zinc-800 overflow-hidden relative group">
                                       {endKf?.imageUrl ? (
                                           <img src={endKf.imageUrl} className="w-full h-full object-contain cursor-pointer" onClick={() => window.open(endKf.imageUrl, '_blank')} />
                                       ) : (
                                           <div className="absolute inset-0 flex items-center justify-center">
                                               <span className="text-[9px] text-zinc-700 uppercase">Optional</span>
                                           </div>
                                       )}
                                       {/* Loading State matching ID */}
                                       {((endKf && processingState?.id === endKf.id) || (processingState?.type === 'kf_end' && !endKf)) && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                            </div>
                                       )}
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* Section 4: Video Generation */}
                       <div className="bg-[#141414] rounded-xl p-5 border border-zinc-800 space-y-4">
                           <div className="flex items-center justify-between">
                               <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                  <Video className="w-3 h-3 text-indigo-500" />
                                  视频生成 (Veo)
                               </h4>
                               {activeShot.interval?.status === 'completed' && <span className="text-[10px] text-green-500 font-mono flex items-center gap-1">● READY</span>}
                           </div>
                           
                           {activeShot.interval?.videoUrl ? (
                               <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-zinc-700 relative shadow-lg">
                                   <video src={activeShot.interval.videoUrl} controls className="w-full h-full" />
                               </div>
                           ) : (
                               <div className="w-full aspect-video bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 flex items-center justify-center">
                                   <span className="text-xs text-zinc-600 font-mono">PREVIEW AREA</span>
                               </div>
                           )}

                           <button
                             onClick={() => handleGenerateVideo(activeShot)}
                             disabled={!startKf?.imageUrl || processingState?.type === 'video'}
                             className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                               activeShot.interval?.videoUrl 
                                 ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                 : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                             } ${(!startKf?.imageUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                           >
                             {processingState?.type === 'video' ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  生成视频中...
                                </>
                             ) : (
                                <>
                                  {activeShot.interval?.videoUrl ? '重新生成视频' : '开始生成视频'}
                                </>
                             )}
                           </button>
                           
                           {!endKf?.imageUrl && (
                               <div className="text-[9px] text-zinc-500 text-center font-mono">
                                  * 未检测到结束帧，将使用单图生成模式 (Image-to-Video)
                               </div>
                           )}
                       </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default StageDirector;