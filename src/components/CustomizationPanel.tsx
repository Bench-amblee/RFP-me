import React, { useState } from 'react';

const CustomizationPanel = ({ setStyles }) => {
    const [headingColor, setHeadingColor] = useState('#2563eb');
    const [textColor, setTextColor] = useState('#374151');
    const [headingFont, setHeadingFont] = useState('Arial');
    const [textFont, setTextFont] = useState('Arial');
    const [headingFontSize, setHeadingFontSize] = useState('24px');
    const [textFontSize, setTextFontSize] = useState('14px');

    const handleApply = () => {
        setStyles({
            headingColor,
            textColor,
            headingFontFamily: headingFont,
            textFontFamily: textFont,
            headingFontSize,
            textFontSize,
        });
    };

    return (
        <div className="customization-panel p-4 bg-gray-100 border rounded mb-4">
            <h2 className="text-lg font-bold mb-2">Customize Your Document</h2>

            {/* Heading Color Picker */}
            <label className="block mb-2">
                <span className="text-sm">Heading Color:</span>
                <input
                    type="color"
                    value={headingColor}
                    onChange={(e) => setHeadingColor(e.target.value)}
                    className="ml-2"
                />
            </label>

            {/* Text Color Picker */}
            <label className="block mb-2">
                <span className="text-sm">Text Color:</span>
                <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="ml-2"
                />
            </label>

            {/* Font Selector for Headings */}
            <label className="block mb-2">
                <span className="text-sm">Heading Font Family:</span>
                <select
                    value={headingFont}
                    onChange={(e) => setHeadingFont(e.target.value)}
                    className="ml-2 p-1 border rounded"
                >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Roboto">Roboto</option>
                </select>
            </label>

            {/* Font Selector for Text */}
            <label className="block mb-2">
                <span className="text-sm">Text Font Family:</span>
                <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="ml-2 p-1 border rounded"
                >
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Roboto">Roboto</option>
                </select>
            </label>

            {/* Heading Font Size Selector */}
            <label className="block mb-2">
                <span className="text-sm">Heading Font Size (px):</span>
                <input
                    type="number"
                    value={parseInt(headingFontSize, 10)}
                    onChange={(e) => setHeadingFontSize(`${e.target.value}px`)}
                    className="ml-2 p-1 border rounded w-20"
                    min="12"
                    max="48"
                />
            </label>

            {/* Text Font Size Selector */}
            <label className="block mb-2">
                <span className="text-sm">Text Font Size (px):</span>
                <input
                    type="number"
                    value={parseInt(textFontSize, 10)}
                    onChange={(e) => setTextFontSize(`${e.target.value}px`)}
                    className="ml-2 p-1 border rounded w-20"
                    min="10"
                    max="24"
                />
            </label>

            <button
                onClick={handleApply}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Apply Styles
            </button>
        </div>
    );
};

export default CustomizationPanel;

