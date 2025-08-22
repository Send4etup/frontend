// Анимация перехода между страницами
export const pageTransition = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

// Анимация появления элементов
export const itemAnimation = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

// Специальные анимации для тестов
export const questionTransition = {
    initial: { opacity: 0, x: 50 },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    exit: {
        opacity: 0,
        x: -50,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

export const optionAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    }
};

export const progressAnimation = {
    initial: { scaleX: 0 },
    animate: {
        scaleX: 1,
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

export const resultAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "backOut"
        }
    }
};

export const modalAnimation = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2, ease: 'backOut' } }
};