import json
from models import db, User, Course, Module, Lesson, Enrollment, LessonProgress, Quiz, QuizQuestion, QuizResult, Certificate

def seed_database():
    print("Seeding database with production masterclass data...")

    # 1. Users
    alex = User(
        id='usr_alex_morgan',
        name='Alex Morgan',
        email='alex.morgan@systems.eng',
        role='student',
        avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        title='Senior Systems Engineer'
    )
    sarah = User(
        id='usr_sarah_chen',
        name='Dr. Sarah Chen',
        email='sarah.chen@clarity.edu',
        role='instructor',
        avatar='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        title='Staff Systems Architect & ex-Google Principal'
    )
    db.session.add_all([alex, sarah])

    # 2. Main Course from Screenshot
    c1 = Course(
        id='arch-microservices-101',
        title='Modern System Architecture & Fault-Tolerant Microservices',
        badge='Top Rated Masterclass',
        rating=4.95,
        review_count=2340,
        category='System Architecture',
        price=94.00,
        original_price=149.00,
        short_description='Master the engineering principles behind mission-critical web-scale platforms. Learn to dissect CAP theorem compromises, architect asynchronous event pipelines with Apache Kafka, implement Envoy service meshes, and build resilience with chaos engineering under real production loads.',
        full_description='Comprehensive masterclass by Dr. Sarah Chen covering zero-downtime microservices pipelines, Raft consensus mechanics, multi-region database sharding, Envoy service mesh rate-limiting, and automated chaos injection.',
        thumbnail='https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        preview_video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        preview_duration='3m 45s',
        instructor_name='Dr. Sarah Chen',
        instructor_bio='16+ years designing distributed engines powering millions of queries per second. Author of "Resilient Data Fabrics" and active Apache Foundation contributor.',
        instructor_avatar='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    )
    db.session.add(c1)

    # 3. Modules and Lessons
    m1 = Module(
        id='mod-1',
        course_id=c1.id,
        module_number=1,
        title='Foundations of Distributed Systems & CAP Theorem',
        badge='Core Concepts',
        duration='6 lessons • 3h 10m total'
    )
    db.session.add(m1)

    lessons_data = [
        ('les-1-1', '1.1 The Fallacies of Distributed Computing in Modern Microservices', 'Architecture Lecture • Slides Included', '28:14', 'lecture', True, False, 'Distributed Fallacies Cheat Sheet.pdf'),
        ('les-1-2', '1.2 PACELC & Real-World Trade-Offs: Beyond Simple CAP Models', 'Theoretical Foundations & Proofs', '34:50', 'lecture', True, False, 'PACELC Theorem Whitepaper.pdf'),
        ('les-1-3', '1.3 Consensus Mechanics: Paxos vs Raft in High-Throughput Clusters', 'Interactive State Machine Demo', '42:10', 'lab', False, False, 'Raft State Machine Spec.pdf'),
        ('les-1-4', '1.4 Network Partitions, Split-Brain Scenarios & Fencing Tokens', 'Production Failure Analysis', '31:25', 'lecture', False, False, 'Fencing Tokens Guide.pdf'),
        ('les-1-5', '1.5 Hands-on Lab: Simulating Jepsen Partitions on a 3-Node Cluster', 'Docker Compose & Toxiproxy Repo', '38:15', 'lab', False, False, 'Toxiproxy Lab Manifest.pdf'),
        ('les-1-6', '1.6 Module Assessment: Architecture Scenario Validation Quiz', '15 Comprehensive Questions', '15:00', 'quiz', False, False, None),
    ]

    for lid, title, sub, dur, ltype, free_prev, locked, pdf in lessons_data:
        les = Lesson(
            id=lid,
            module_id=m1.id,
            title=title,
            subtitle=sub,
            duration=dur,
            lesson_type=ltype,
            video_url='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            is_free_preview=free_prev,
            is_locked=locked,
            pdf_title=pdf,
            notes='Distributed systems invariants, network partitions, and monotonic fencing token synchronization.'
        )
        db.session.add(les)

    # 4. Enrollment & Progress
    enr = Enrollment(user_id=alex.id, course_id=c1.id)
    p1 = LessonProgress(user_id=alex.id, lesson_id='les-1-1', completed=True)
    p2 = LessonProgress(user_id=alex.id, lesson_id='les-1-2', completed=True)
    db.session.add_all([enr, p1, p2])

    # 5. Quiz & Questions
    quiz = Quiz(id='quiz-mod-1', course_id=c1.id, title='Architecture Scenario Validation Quiz', passing_score=80)
    db.session.add(quiz)

    q1 = QuizQuestion(
        id=1,
        quiz_id=quiz.id,
        question_text='According to the PACELC theorem, what trade-off must a distributed system make when there is NO network partition occurring?',
        explanation='PACELC states that if there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C).',
        options_json=json.dumps([
            {'id': 'a', 'text': 'Availability vs Partition Tolerance'},
            {'id': 'b', 'text': 'Latency vs Consistency'},
            {'id': 'c', 'text': 'Durability vs Throughput'},
            {'id': 'd', 'text': 'Linearizability vs Eventual Consistency'}
        ]),
        correct_option_id='b'
    )
    q2 = QuizQuestion(
        id=2,
        quiz_id=quiz.id,
        question_text='In a distributed locking system, why is a simple TTL-based lease insufficient to prevent split-brain write anomalies under stop-the-world GC pauses?',
        explanation='A client may experience a garbage collection pause exceeding TTL. It resumes after expiration and writes stale data unless fenced by monotonic tokens.',
        options_json=json.dumps([
            {'id': 'a', 'text': 'Because NTP clock drifts can exceed several seconds across cloud hypervisors'},
            {'id': 'b', 'text': 'Because the original client can wake up after TTL expiry and perform stale writes unless fenced by a monotonic token'},
            {'id': 'c', 'text': 'Because TCP connections keep the socket open even when threads are paused'},
            {'id': 'd', 'text': 'Because ZooKeeper ephemeral nodes never auto-delete upon heartbeat failure'}
        ]),
        correct_option_id='b'
    )
    db.session.add_all([q1, q2])

    # 6. Sample Certificate for Alex
    cert = Certificate(
        certificate_code='CL-89241-ARCH',
        user_id=alex.id,
        course_id=c1.id,
        instructor_signature='Dr. Sarah Chen'
    )
    db.session.add(cert)

    db.session.commit()
    print("Database seeding completed successfully!")
