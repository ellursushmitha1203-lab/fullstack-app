import prisma from "./config/db";

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.videoProgress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.section.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create subjects
  const python = await prisma.subject.create({
    data: {
      title: "Python Programming",
      slug: "python-programming",
      description:
        "Learn Python from scratch. Cover basics, data types, control flow, functions, OOP, and more.",
      thumbnail: "https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
      is_published: true,
    },
  });

  const dsa = await prisma.subject.create({
    data: {
      title: "Data Structures & Algorithms",
      slug: "data-structures-algorithms",
      description:
        "Master data structures and algorithms with clear explanations and coding examples.",
      thumbnail: "https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg",
      is_published: true,
    },
  });

  const webdev = await prisma.subject.create({
    data: {
      title: "Web Development",
      slug: "web-development",
      description:
        "Full-stack web development covering HTML, CSS, JavaScript, React, Node.js, and more.",
      thumbnail: "https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg",
      is_published: true,
    },
  });

  // Python sections and videos
  const pySection1 = await prisma.section.create({
    data: {
      subject_id: python.id,
      title: "Getting Started with Python",
      order_index: 1,
    },
  });

  const pySection2 = await prisma.section.create({
    data: {
      subject_id: python.id,
      title: "Python Data Structures",
      order_index: 2,
    },
  });

  await prisma.video.createMany({
    data: [
      {
        section_id: pySection1.id,
        title: "Python Tutorial for Beginners",
        description: "Complete Python tutorial for absolute beginners.",
        youtube_url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        order_index: 1,
        duration_seconds: 3600,
      },
      {
        section_id: pySection1.id,
        title: "Python Variables and Data Types",
        description: "Learn about variables, strings, numbers, and booleans in Python.",
        youtube_url: "https://www.youtube.com/watch?v=cQT33yu9pY8",
        order_index: 2,
        duration_seconds: 1800,
      },
      {
        section_id: pySection1.id,
        title: "Python Control Flow",
        description: "If statements, loops, and control flow in Python.",
        youtube_url: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
        order_index: 3,
        duration_seconds: 2400,
      },
      {
        section_id: pySection2.id,
        title: "Python Lists and Tuples",
        description: "Working with lists and tuples in Python.",
        youtube_url: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
        order_index: 1,
        duration_seconds: 2100,
      },
      {
        section_id: pySection2.id,
        title: "Python Dictionaries",
        description: "Understanding dictionaries and their methods.",
        youtube_url: "https://www.youtube.com/watch?v=daefaLgNkw0",
        order_index: 2,
        duration_seconds: 1500,
      },
    ],
  });

  // DSA sections and videos
  const dsaSection1 = await prisma.section.create({
    data: {
      subject_id: dsa.id,
      title: "Introduction to DSA",
      order_index: 1,
    },
  });

  const dsaSection2 = await prisma.section.create({
    data: {
      subject_id: dsa.id,
      title: "Sorting Algorithms",
      order_index: 2,
    },
  });

  await prisma.video.createMany({
    data: [
      {
        section_id: dsaSection1.id,
        title: "Data Structures Introduction",
        description: "Introduction to data structures and why they matter.",
        youtube_url: "https://www.youtube.com/watch?v=8hly31xKli0",
        order_index: 1,
        duration_seconds: 2700,
      },
      {
        section_id: dsaSection1.id,
        title: "Arrays and Linked Lists",
        description: "Understanding arrays and linked lists.",
        youtube_url: "https://www.youtube.com/watch?v=DyoVR_MVqSg",
        order_index: 2,
        duration_seconds: 3000,
      },
      {
        section_id: dsaSection2.id,
        title: "Bubble Sort Algorithm",
        description: "Learn how bubble sort works step by step.",
        youtube_url: "https://www.youtube.com/watch?v=xli_FI7CuzA",
        order_index: 1,
        duration_seconds: 1200,
      },
      {
        section_id: dsaSection2.id,
        title: "Quick Sort Algorithm",
        description: "Deep dive into quick sort algorithm.",
        youtube_url: "https://www.youtube.com/watch?v=Hoixgm4-P4M",
        order_index: 2,
        duration_seconds: 1800,
      },
    ],
  });

  // Web Development sections and videos
  const webSection1 = await prisma.section.create({
    data: {
      subject_id: webdev.id,
      title: "HTML & CSS Basics",
      order_index: 1,
    },
  });

  const webSection2 = await prisma.section.create({
    data: {
      subject_id: webdev.id,
      title: "JavaScript Fundamentals",
      order_index: 2,
    },
  });

  await prisma.video.createMany({
    data: [
      {
        section_id: webSection1.id,
        title: "HTML Crash Course",
        description: "Learn HTML in one hour.",
        youtube_url: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        order_index: 1,
        duration_seconds: 3600,
      },
      {
        section_id: webSection1.id,
        title: "CSS Crash Course",
        description: "Learn CSS fundamentals quickly.",
        youtube_url: "https://www.youtube.com/watch?v=yfoY53QXEnI",
        order_index: 2,
        duration_seconds: 3900,
      },
      {
        section_id: webSection2.id,
        title: "JavaScript Tutorial for Beginners",
        description: "Complete JavaScript tutorial from scratch.",
        youtube_url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        order_index: 1,
        duration_seconds: 4800,
      },
      {
        section_id: webSection2.id,
        title: "JavaScript DOM Manipulation",
        description: "Learn to manipulate the DOM with JavaScript.",
        youtube_url: "https://www.youtube.com/watch?v=5fb2aPlgoys",
        order_index: 2,
        duration_seconds: 2400,
      },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
