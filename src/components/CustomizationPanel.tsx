import React, { useState } from 'react';

const CustomizationPanel = ({ setStyles }) => {
    const [color, setColor] = useState('#333333');
    const [font, setFont] = useState('Arial');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApply = () => {
        setStyles({
            color,
            fontFamily: font,
        });
    };

    const togglePanel = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className="customization-panel bg-gray-100 border rounded mb-4">
            <button
                onClick={togglePanel}
                className="flex items-center justify-between w-full p-4 bg-blue-100 text-blue-600 font-bold text-lg rounded-t-md focus:outline-none"
            >
                Customize Your Document
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            
            {isExpanded && (
                <div className="p-4">
                    <label className="block mb-2">
                        <span className="text-sm">Primary Color:</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="ml-2"
                        />
                    </label>

                    <label className="block mb-2">
                        <span className="text-sm">Font Family:</span>
                        <select
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                            className="ml-2 p-1 border rounded"
                        >
                            <option value="Arial">Arial</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Roboto">Roboto</option>
                        </select>
                    </label>

                    <button
                        onClick={handleApply}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Apply Styles
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomizationPanel;

