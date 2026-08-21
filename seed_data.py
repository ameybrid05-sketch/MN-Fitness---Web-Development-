"""
Seed the database with default workout plans, diet plans, articles, and admin user.
Run once after creating tables.
"""
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash


WORKOUT_PLANS = [
    # ── WEIGHT LOSS ──────────────────────────────────────────────────────────
    {
        "name": "Fat Burn Starter",
        "goal": "weight_loss",
        "level": "beginner",
        "description": "A 4-week beginner program focused on burning fat through cardio and bodyweight exercises.",
        "duration_weeks": 4,
        "exercises": [
            {"day": "Monday", "name": "Brisk Walk / Light Jog", "duration": "30 min", "calories": 200},
            {"day": "Monday", "name": "Jumping Jacks", "sets": 3, "reps": 20},
            {"day": "Monday", "name": "Bodyweight Squats", "sets": 3, "reps": 15},
            {"day": "Wednesday", "name": "Cycling / Stationary Bike", "duration": "30 min", "calories": 250},
            {"day": "Wednesday", "name": "Push-ups (knee)", "sets": 3, "reps": 10},
            {"day": "Wednesday", "name": "Plank", "sets": 3, "duration": "20 sec"},
            {"day": "Friday", "name": "Swimming / Aerobics", "duration": "30 min", "calories": 300},
            {"day": "Friday", "name": "Lunges", "sets": 3, "reps": 12},
            {"day": "Friday", "name": "Mountain Climbers", "sets": 3, "reps": 15},
        ]
    },
    {
        "name": "Cardio Blast",
        "goal": "weight_loss",
        "level": "intermediate",
        "description": "High-intensity cardio sessions combined with strength training for maximum fat loss.",
        "duration_weeks": 6,
        "exercises": [
            {"day": "Monday", "name": "HIIT Treadmill", "duration": "20 min", "calories": 300},
            {"day": "Monday", "name": "Burpees", "sets": 4, "reps": 15},
            {"day": "Monday", "name": "Box Jumps", "sets": 3, "reps": 12},
            {"day": "Tuesday", "name": "Cycling", "duration": "45 min", "calories": 400},
            {"day": "Thursday", "name": "Jump Rope", "duration": "20 min", "calories": 250},
            {"day": "Thursday", "name": "Kettlebell Swings", "sets": 4, "reps": 20},
            {"day": "Saturday", "name": "Long Run", "duration": "45 min", "calories": 450},
        ]
    },
    # ── WEIGHT GAIN ──────────────────────────────────────────────────────────
    {
        "name": "Lean Bulk Foundation",
        "goal": "weight_gain",
        "level": "beginner",
        "description": "A structured 6-week program to build lean muscle mass for beginners.",
        "duration_weeks": 6,
        "exercises": [
            {"day": "Monday", "name": "Barbell Squat", "sets": 3, "reps": 10, "rest": "90 sec"},
            {"day": "Monday", "name": "Bench Press", "sets": 3, "reps": 10, "rest": "90 sec"},
            {"day": "Monday", "name": "Bent-over Row", "sets": 3, "reps": 10, "rest": "90 sec"},
            {"day": "Wednesday", "name": "Overhead Press", "sets": 3, "reps": 10, "rest": "90 sec"},
            {"day": "Wednesday", "name": "Deadlift", "sets": 3, "reps": 8, "rest": "2 min"},
            {"day": "Wednesday", "name": "Pull-ups / Lat Pulldown", "sets": 3, "reps": 8},
            {"day": "Friday", "name": "Leg Press", "sets": 3, "reps": 12},
            {"day": "Friday", "name": "Dumbbell Curl", "sets": 3, "reps": 12},
            {"day": "Friday", "name": "Tricep Dips", "sets": 3, "reps": 12},
        ]
    },
    {
        "name": "Mass Builder",
        "goal": "weight_gain",
        "level": "intermediate",
        "description": "Progressive overload program designed to maximize muscle hypertrophy.",
        "duration_weeks": 8,
        "exercises": [
            {"day": "Monday - Chest/Triceps", "name": "Flat Bench Press", "sets": 4, "reps": 8},
            {"day": "Monday - Chest/Triceps", "name": "Incline Dumbbell Press", "sets": 3, "reps": 10},
            {"day": "Monday - Chest/Triceps", "name": "Cable Flyes", "sets": 3, "reps": 12},
            {"day": "Tuesday - Back/Biceps", "name": "Deadlift", "sets": 4, "reps": 6},
            {"day": "Tuesday - Back/Biceps", "name": "Pull-ups", "sets": 4, "reps": 8},
            {"day": "Thursday - Legs", "name": "Barbell Squat", "sets": 4, "reps": 8},
            {"day": "Thursday - Legs", "name": "Romanian Deadlift", "sets": 3, "reps": 10},
            {"day": "Saturday - Shoulders", "name": "Military Press", "sets": 4, "reps": 8},
        ]
    },
    # ── BODYBUILDING ─────────────────────────────────────────────────────────
    {
        "name": "Bodybuilding Fundamentals",
        "goal": "bodybuilding",
        "level": "beginner",
        "description": "Classic bodybuilding split for beginners focusing on muscle symmetry and definition.",
        "duration_weeks": 8,
        "exercises": [
            {"day": "Monday - Chest", "name": "Bench Press", "sets": 4, "reps": 10},
            {"day": "Monday - Chest", "name": "Incline Press", "sets": 3, "reps": 12},
            {"day": "Monday - Chest", "name": "Pec Deck", "sets": 3, "reps": 15},
            {"day": "Tuesday - Back", "name": "Lat Pulldown", "sets": 4, "reps": 10},
            {"day": "Tuesday - Back", "name": "Seated Cable Row", "sets": 3, "reps": 12},
            {"day": "Wednesday - Shoulders", "name": "Dumbbell Press", "sets": 4, "reps": 10},
            {"day": "Wednesday - Shoulders", "name": "Lateral Raises", "sets": 3, "reps": 15},
            {"day": "Thursday - Arms", "name": "Barbell Curl", "sets": 4, "reps": 12},
            {"day": "Thursday - Arms", "name": "Skull Crushers", "sets": 3, "reps": 12},
            {"day": "Friday - Legs", "name": "Squat", "sets": 4, "reps": 10},
            {"day": "Friday - Legs", "name": "Leg Curl", "sets": 3, "reps": 12},
            {"day": "Friday - Legs", "name": "Calf Raises", "sets": 4, "reps": 20},
        ]
    },
    {
        "name": "Competition Prep",
        "goal": "bodybuilding",
        "level": "advanced",
        "description": "Advanced 12-week competition preparation program with high volume training.",
        "duration_weeks": 12,
        "exercises": [
            {"day": "Monday - Chest/Abs", "name": "Flat Bench Press", "sets": 5, "reps": 8},
            {"day": "Monday - Chest/Abs", "name": "Incline Dumbbell Press", "sets": 4, "reps": 10},
            {"day": "Monday - Chest/Abs", "name": "Cable Crossover", "sets": 4, "reps": 12},
            {"day": "Tuesday - Back/Traps", "name": "Deadlift", "sets": 5, "reps": 5},
            {"day": "Tuesday - Back/Traps", "name": "Barbell Row", "sets": 4, "reps": 8},
            {"day": "Wednesday - Shoulders", "name": "Military Press", "sets": 5, "reps": 8},
            {"day": "Thursday - Arms", "name": "EZ Bar Curl", "sets": 5, "reps": 10},
            {"day": "Friday - Legs", "name": "Squat", "sets": 5, "reps": 8},
            {"day": "Saturday - Full Body", "name": "Power Clean", "sets": 4, "reps": 5},
        ]
    },
]

DIET_PLANS = [
    # ── WEIGHT LOSS ──────────────────────────────────────────────────────────
    {
        "name": "Calorie Deficit Plan",
        "goal": "weight_loss",
        "calories_per_day": 1500,
        "protein_g": 120,
        "carbs_g": 150,
        "fat_g": 45,
        "description": "A balanced calorie-deficit diet to promote steady fat loss while preserving muscle.",
        "meals": [
            {
                "meal": "Breakfast",
                "time": "7:00 AM",
                "foods": ["Oatmeal (1 cup)", "Banana (1 medium)", "Egg whites (3)", "Green tea"],
                "calories": 350
            },
            {
                "meal": "Mid-Morning Snack",
                "time": "10:00 AM",
                "foods": ["Apple (1)", "Almonds (10 pieces)"],
                "calories": 150
            },
            {
                "meal": "Lunch",
                "time": "1:00 PM",
                "foods": ["Grilled chicken breast (150g)", "Brown rice (1/2 cup)", "Mixed salad", "Lemon dressing"],
                "calories": 450
            },
            {
                "meal": "Evening Snack",
                "time": "4:00 PM",
                "foods": ["Greek yogurt (1 cup)", "Berries (1/2 cup)"],
                "calories": 150
            },
            {
                "meal": "Dinner",
                "time": "7:00 PM",
                "foods": ["Baked salmon (150g)", "Steamed broccoli (1 cup)", "Sweet potato (small)"],
                "calories": 400
            }
        ]
    },
    {
        "name": "Keto Fat Loss",
        "goal": "weight_loss",
        "calories_per_day": 1600,
        "protein_g": 130,
        "carbs_g": 30,
        "fat_g": 110,
        "description": "Low-carb ketogenic diet for rapid fat burning.",
        "meals": [
            {
                "meal": "Breakfast",
                "time": "8:00 AM",
                "foods": ["Scrambled eggs (3)", "Avocado (1/2)", "Bacon (2 strips)", "Black coffee"],
                "calories": 450
            },
            {
                "meal": "Lunch",
                "time": "1:00 PM",
                "foods": ["Tuna salad with mayo", "Lettuce wraps", "Cheese (30g)"],
                "calories": 500
            },
            {
                "meal": "Dinner",
                "time": "7:00 PM",
                "foods": ["Grilled steak (200g)", "Asparagus (1 cup)", "Butter (1 tbsp)"],
                "calories": 650
            }
        ]
    },
    # ── WEIGHT GAIN ──────────────────────────────────────────────────────────
    {
        "name": "Clean Bulk Diet",
        "goal": "weight_gain",
        "calories_per_day": 3000,
        "protein_g": 180,
        "carbs_g": 350,
        "fat_g": 80,
        "description": "High-calorie clean diet to support muscle growth with minimal fat gain.",
        "meals": [
            {
                "meal": "Breakfast",
                "time": "7:00 AM",
                "foods": ["Oatmeal (2 cups)", "Whole eggs (3)", "Banana (1)", "Peanut butter (2 tbsp)", "Milk (1 cup)"],
                "calories": 700
            },
            {
                "meal": "Mid-Morning",
                "time": "10:00 AM",
                "foods": ["Mass gainer shake", "Almonds (30g)"],
                "calories": 400
            },
            {
                "meal": "Lunch",
                "time": "1:00 PM",
                "foods": ["Chicken breast (200g)", "White rice (1.5 cups)", "Vegetables", "Olive oil"],
                "calories": 750
            },
            {
                "meal": "Pre-Workout",
                "time": "4:00 PM",
                "foods": ["Banana (2)", "Protein shake", "Whole wheat bread (2 slices)"],
                "calories": 400
            },
            {
                "meal": "Dinner",
                "time": "8:00 PM",
                "foods": ["Beef (200g)", "Pasta (1.5 cups)", "Tomato sauce", "Parmesan"],
                "calories": 750
            }
        ]
    },
    {
        "name": "High Protein Bulk",
        "goal": "weight_gain",
        "calories_per_day": 3500,
        "protein_g": 220,
        "carbs_g": 400,
        "fat_g": 90,
        "description": "Maximum protein intake for serious muscle building.",
        "meals": [
            {
                "meal": "Breakfast",
                "time": "6:30 AM",
                "foods": ["Egg whites (6)", "Whole eggs (2)", "Oatmeal (2 cups)", "Whey protein shake"],
                "calories": 800
            },
            {
                "meal": "Lunch",
                "time": "12:00 PM",
                "foods": ["Chicken breast (250g)", "Brown rice (2 cups)", "Broccoli", "Olive oil"],
                "calories": 900
            },
            {
                "meal": "Post-Workout",
                "time": "4:00 PM",
                "foods": ["Whey protein (2 scoops)", "Banana (2)", "Dextrose (50g)"],
                "calories": 500
            },
            {
                "meal": "Dinner",
                "time": "7:30 PM",
                "foods": ["Salmon (200g)", "Sweet potato (2 medium)", "Asparagus"],
                "calories": 700
            },
            {
                "meal": "Before Bed",
                "time": "10:00 PM",
                "foods": ["Casein protein shake", "Cottage cheese (1 cup)"],
                "calories": 400
            }
        ]
    },
    # ── BODYBUILDING ─────────────────────────────────────────────────────────
    {
        "name": "Bodybuilder's Diet",
        "goal": "bodybuilding",
        "calories_per_day": 2800,
        "protein_g": 200,
        "carbs_g": 300,
        "fat_g": 70,
        "description": "Precision nutrition plan for bodybuilders focusing on muscle definition.",
        "meals": [
            {
                "meal": "Breakfast",
                "time": "6:00 AM",
                "foods": ["Egg whites (8)", "Oatmeal (1 cup)", "Blueberries (1/2 cup)"],
                "calories": 500
            },
            {
                "meal": "Mid-Morning",
                "time": "9:00 AM",
                "foods": ["Chicken breast (150g)", "Brown rice (1 cup)", "Vegetables"],
                "calories": 500
            },
            {
                "meal": "Lunch",
                "time": "12:00 PM",
                "foods": ["Tuna (200g)", "Sweet potato (1 large)", "Green beans"],
                "calories": 550
            },
            {
                "meal": "Pre-Workout",
                "time": "3:00 PM",
                "foods": ["Whey protein", "Banana", "Rice cakes (3)"],
                "calories": 350
            },
            {
                "meal": "Post-Workout",
                "time": "6:00 PM",
                "foods": ["Whey protein (2 scoops)", "White rice (1 cup)", "Banana"],
                "calories": 500
            },
            {
                "meal": "Dinner",
                "time": "8:00 PM",
                "foods": ["Lean beef (200g)", "Broccoli (2 cups)", "Olive oil"],
                "calories": 400
            }
        ]
    },
]

ARTICLES = [
    {
        "title": "5 Essential Tips for Beginners Starting Their Fitness Journey",
        "category": "Fitness Tips",
        "content": """Starting your fitness journey can feel overwhelming, but with the right approach, you can build lasting habits that transform your health.

**1. Start Slow and Build Gradually**
Don't try to do everything at once. Begin with 2-3 workout sessions per week and gradually increase intensity and frequency as your body adapts.

**2. Focus on Form Over Weight**
Proper technique prevents injuries and ensures you're targeting the right muscles. Master bodyweight exercises before adding resistance.

**3. Nutrition is 70% of the Battle**
You can't out-train a bad diet. Focus on whole foods, adequate protein (0.8-1g per pound of bodyweight), and stay hydrated.

**4. Rest and Recovery Matter**
Muscles grow during rest, not during workouts. Aim for 7-9 hours of sleep and take rest days seriously.

**5. Track Your Progress**
Keep a workout journal or use an app to log your exercises, weights, and how you feel. Progress tracking keeps you motivated and helps identify what works.""",
        "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
    },
    {
        "title": "Understanding Macronutrients: Protein, Carbs, and Fats",
        "category": "Nutrition",
        "content": """Macronutrients are the three main categories of nutrients that provide energy and support bodily functions.

**Protein (4 calories/gram)**
Essential for muscle repair and growth. Sources: chicken, fish, eggs, legumes, dairy. Aim for 0.7-1g per pound of body weight.

**Carbohydrates (4 calories/gram)**
Your body's primary energy source. Choose complex carbs: oats, brown rice, sweet potatoes, vegetables. Time them around workouts for best results.

**Fats (9 calories/gram)**
Critical for hormone production and nutrient absorption. Focus on healthy fats: avocados, nuts, olive oil, fatty fish.

**Finding Your Balance**
- Weight Loss: Calorie deficit (300-500 below maintenance)
- Weight Gain: Calorie surplus (300-500 above maintenance)
- Bodybuilding: High protein, moderate carbs, controlled fats""",
        "image_url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"
    },
    {
        "title": "The Science of Weight Loss: What Actually Works",
        "category": "Weight Loss",
        "content": """Weight loss comes down to one fundamental principle: calories in vs calories out. But the details matter enormously.

**Caloric Deficit**
To lose 1 pound of fat per week, you need a deficit of approximately 3,500 calories (500 calories/day). Aim for 0.5-1% of body weight loss per week.

**Preserve Muscle Mass**
High protein intake (1g per pound of bodyweight) combined with resistance training prevents muscle loss during a cut.

**Cardio Strategy**
LISS (Low Intensity Steady State) cardio is sustainable and burns fat efficiently. HIIT burns more calories in less time but is harder to recover from.

**Hormones and Sleep**
Poor sleep increases cortisol and ghrelin (hunger hormone) while decreasing leptin (satiety hormone). Prioritize 7-9 hours of quality sleep.

**Sustainable Approach**
Crash diets fail long-term. Build habits you can maintain for life.""",
        "image_url": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800"
    },
    {
        "title": "Building Muscle: The Complete Guide to Hypertrophy",
        "category": "Bodybuilding",
        "content": """Muscle hypertrophy (growth) occurs when muscle fibers are damaged through exercise and repair larger and stronger.

**Progressive Overload**
The most important principle in bodybuilding. Continuously increase the demands on your muscles through more weight, reps, sets, or reduced rest time.

**Training Volume**
Research suggests 10-20 sets per muscle group per week for optimal growth. Beginners can grow with less; advanced lifters may need more.

**Rep Ranges**
- Strength: 1-5 reps at 85-100% 1RM
- Hypertrophy: 6-12 reps at 65-85% 1RM
- Endurance: 12-20 reps at 50-65% 1RM

**Compound vs Isolation**
Build your program around compound movements (squat, deadlift, bench, row, press) and supplement with isolation exercises.

**Recovery**
Each muscle group needs 48-72 hours to recover. A push/pull/legs split or upper/lower split optimizes frequency and recovery.""",
        "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
    },
    {
        "title": "Hydration and Performance: How Water Affects Your Workout",
        "category": "Nutrition",
        "content": """Water makes up 60% of your body and plays a crucial role in every physiological process.

**Performance Impact**
Even 2% dehydration can reduce performance by 10-20%. Proper hydration improves strength, endurance, and cognitive function.

**How Much to Drink**
General guideline: 8-10 glasses (2-2.5 liters) per day. Add 500ml for every 30 minutes of exercise. More in hot weather.

**Electrolytes**
During intense exercise, you lose sodium, potassium, and magnesium through sweat. Replenish with sports drinks or electrolyte tablets for sessions over 60 minutes.

**Signs of Dehydration**
Dark urine, fatigue, headaches, decreased performance, muscle cramps.

**Hydration Strategy**
- Drink 500ml 2 hours before exercise
- Sip 150-250ml every 15-20 minutes during exercise
- Rehydrate with 150% of fluid lost after exercise""",
        "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800"
    },
    {
        "title": "Mental Health and Exercise: The Mind-Body Connection",
        "category": "Wellness",
        "content": """Exercise is one of the most powerful tools for improving mental health, yet it's often overlooked.

**The Science**
Physical activity releases endorphins, serotonin, dopamine, and norepinephrine — neurotransmitters that improve mood and reduce anxiety.

**Benefits for Mental Health**
- Reduces symptoms of depression and anxiety
- Improves sleep quality
- Boosts self-esteem and confidence
- Reduces stress hormones (cortisol)
- Improves cognitive function and memory

**How Much Exercise?**
The WHO recommends 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week for mental health benefits.

**Getting Started**
Even a 10-minute walk can improve mood. Start small and build consistency. The best exercise is the one you'll actually do.""",
        "image_url": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
    },
]


def seed_database(db: Session):
    """Seed the database with initial data."""

    # Create admin user
    admin_exists = db.query(models.User).filter(
        models.User.username == "admin"
    ).first()
    if not admin_exists:
        admin = models.User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="MN Fitness Admin",
            email="admin@mnfitness.com",
            role=models.RoleEnum.admin,
            is_active=True
        )
        db.add(admin)
        db.flush()

    # Create demo trainer
    trainer_exists = db.query(models.User).filter(
        models.User.username == "trainer1"
    ).first()
    if not trainer_exists:
        trainer = models.User(
            username="trainer1",
            hashed_password=get_password_hash("trainer123"),
            full_name="Naved Shaikh",
            email="naved@mnfitness.com",
            role=models.RoleEnum.trainer,
            is_active=True
        )
        db.add(trainer)
        db.flush()

    # Seed workout plans
    existing_plans = db.query(models.WorkoutPlan).count()
    if existing_plans == 0:
        for plan_data in WORKOUT_PLANS:
            plan = models.WorkoutPlan(**plan_data)
            db.add(plan)

    # Seed diet plans
    existing_diet = db.query(models.DietPlan).count()
    if existing_diet == 0:
        for diet_data in DIET_PLANS:
            diet = models.DietPlan(**diet_data)
            db.add(diet)

    # Seed articles
    existing_articles = db.query(models.Article).count()
    if existing_articles == 0:
        for article_data in ARTICLES:
            article = models.Article(**article_data, is_published=True)
            db.add(article)

    db.commit()
    print("✅ Database seeded successfully!")
