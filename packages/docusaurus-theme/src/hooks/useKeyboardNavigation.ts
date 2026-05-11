import {useEffect} from 'react';

export const keyboardFocusedClassName = 'navigation-with-keyboard';

/**
 * Adds `navigation-with-keyboard` to <body> on Tab, removes it on mousedown.
 * Paired with the body:not(.navigation-with-keyboard) *:not(input):focus rule
 * in layout.css so focus outlines only show for keyboard users.
 *
 * Local replacement for @docusaurus/theme-common/internal's useKeyboardNavigation,
 * which lives under an /internal path that requires @ts-ignore.
 */
export function useKeyboardNavigation(): void {
    useEffect(() => {
        function handle(e: KeyboardEvent | MouseEvent) {
            if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Tab') {
                document.body.classList.add(keyboardFocusedClassName);
            }
            if (e.type === 'mousedown') {
                document.body.classList.remove(keyboardFocusedClassName);
            }
        }
        document.addEventListener('keydown', handle);
        document.addEventListener('mousedown', handle);
        return () => {
            document.body.classList.remove(keyboardFocusedClassName);
            document.removeEventListener('keydown', handle);
            document.removeEventListener('mousedown', handle);
        };
    }, []);
}
