import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AttachedFile from './AttachedFile';

const AttachedFilesList = ({ attachedFiles, onRemoveFile }) => {
    return (
        <AnimatePresence>
            {attachedFiles.length > 0 && (
                <motion.div
                    className="attached-files-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="attached-files-list">
                        {attachedFiles.map((file, index) => (
                            <AttachedFile
                                key={`${file.name}-${index}`}
                                file={file}
                                onRemove={onRemoveFile}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttachedFilesList;