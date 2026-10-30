import React from 'react';
import icons from './icons';

const { HelpCircle } = icons;

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    const IconComponent = icons[name];

    if (!IconComponent) {
        if (import.meta.env.DEV) {
            console.warn(`Icon "${name}" is not registered in src/components/icons.js`);
        }
        return <HelpCircle size={size} color="gray" strokeWidth={strokeWidth} className={className} {...props} />;
    }

    return <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
    />;
}
export default Icon;
