function getClassLoader() {
    const classLoader = {
        Gravity: Java.use("android.view.Gravity"),
        TextView: Java.use("android.widget.TextView"),
        ImageView: Java.use("android.widget.ImageView"),
        Button: Java.use("android.widget.Button"),
        LinearLayout: Java.use("android.widget.LinearLayout"),
        ViewGroup_LayoutParams: Java.use("android.view.ViewGroup$LayoutParams"),
        LinearLayout_LayoutParams: Java.use("android.widget.LinearLayout$LayoutParams"),
        Color: Java.use("android.graphics.Color"),
        ActivityThread: Java.use("android.app.ActivityThread"),
        ActivityThread_ActivityClientRecord: Java.use("android.app.ActivityThread$ActivityClientRecord"),
        View_OnTouchListener: Java.use("android.view.View$OnTouchListener"),
        MotionEvent: Java.use("android.view.MotionEvent"),
        String: Java.use("java.lang.String")
    }
    return classLoader
}

function pixelDensityToPixels(context, dp) {
    const density = context.getResources().getDisplayMetrics().density.value
    return parseInt(dp * density)
}

function getMainActivity(classLoader) {
    const activityThread = classLoader.ActivityThread.sCurrentActivityThread.value
    const mActivities = activityThread.mActivities.value
    const activityClientRecord = Java.cast(mActivities.valueAt(0), classLoader.ActivityThread_ActivityClientRecord)
    return activityClientRecord.activity.value
}

class FloatingButton {
    #classLoader
    #activity
    #MATCH_PARENT
    #WRAP_CONTENT
    #mainLayout
    #floatingButton

    constructor(classLoader, activity) {
        this.#classLoader = classLoader
        this.#activity = activity
        this.#MATCH_PARENT = classLoader.LinearLayout_LayoutParams.MATCH_PARENT.value
        this.#WRAP_CONTENT = classLoader.LinearLayout_LayoutParams.WRAP_CONTENT.value
        this.#createMainLayout()
        this.#createFloatingButton()
    }

    #createMainLayout() {
        const layoutParams = this.#classLoader.LinearLayout_LayoutParams.$new(this.#MATCH_PARENT, this.#MATCH_PARENT)
        this.#mainLayout = this.#classLoader.LinearLayout.$new(this.#activity)
        this.#mainLayout.setLayoutParams(layoutParams)
    }

    #createFloatingButton() {
        const layoutParams = this.#classLoader.LinearLayout_LayoutParams.$new(this.#WRAP_CONTENT, this.#WRAP_CONTENT)
        this.#floatingButton = this.#classLoader.Button.$new(this.#activity)
        this.#floatingButton.setLayoutParams(layoutParams)
        this.#floatingButton.setText(this.#classLoader.String.$new("ABC"))
        this.#floatingButton.setTextSize(pixelDensityToPixels(this.#activity, 6))
        
        this.#floatingButton.setTextColor(this.#classLoader.Color.parseColor("#006400"))
        this.#floatingButton.setBackgroundColor(this.#classLoader.Color.WHITE.value)
    }

    #drawContentView() {
        this.#activity.addContentView(this.#mainLayout, this.#mainLayout.getLayoutParams())
    }

    #drawFloatingButton() {
        this.#mainLayout.addView(this.#floatingButton)
    }

    #createFloatingButtonEvent() {
        const floatingButton = this.#floatingButton
        const mainLayout = this.#mainLayout
        const classLoader = this.#classLoader
        let initialX = 0
        let initialY = 0
        let isMove = false
        let initialTouchTime = 0
        let parent = this;
        const FloatingButtonOnTouchListener = Java.registerClass({
            name: "com.example.FloatingButtonEvent",
            implements: [classLoader.View_OnTouchListener],
            methods: {
                onTouch(view, event) {
                    switch (event.getAction()) {
                        case classLoader.MotionEvent.ACTION_DOWN.value:
                            initialX = view.getX() - event.getRawX();
                            initialY = view.getY() - event.getRawY();
                            isMove = false
                            initialTouchTime = Date.now()
                            break
                        case classLoader.MotionEvent.ACTION_UP.value:
                            if (!isMove) {
                                if (parent.clickCallback ) {
                                    parent.clickCallback ()
                                }
                            }
                            break
                        case classLoader.MotionEvent.ACTION_MOVE.value:
                            view.setX(event.getRawX() + initialX)
                            view.setY(event.getRawY() + initialY)
                            let deltaTime = Date.now() - initialTouchTime
                            if (deltaTime > 200) isMove = true
                            break
                        default:
                            return false
                    }
                    return true
                }
            }
        })
        this.#floatingButton.setOnTouchListener(FloatingButtonOnTouchListener.$new())
    }

    start() {
        this.#drawContentView()
        this.#drawFloatingButton()
        this.#createFloatingButtonEvent()
    }
    addClickCallback(callback) {
        this.clickCallback = callback;
    }
}

Java.perform(function () {
    Java.scheduleOnMainThread(function () {
        const classLoader = getClassLoader()
        const mainActivity = getMainActivity(classLoader)
        const floatingButton = new FloatingButton(classLoader, mainActivity)
        floatingButton.start()
        floatingButton.addClickCallback(function() {
            console.log("hmmm")
        })
    })
})
