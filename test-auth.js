

async function test() {
  const res = await fetch('http://localhost:8080/api/v1/auth/github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      githubId: '184195208',
      username: 'KrishanuRoyEng',
      email: 'krishanuroygit@gmail.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/184195208?v=4',
      githubUrl: 'https://github.com/KrishanuRoyEng'
    })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

test();
