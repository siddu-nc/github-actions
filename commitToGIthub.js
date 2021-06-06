const TOKEN = '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'
const { Octokit } = require('@octokit/rest')
const { generateYaml } = require('./createCronJob');


const main = async () => {

  const octo = new Octokit({
    auth: TOKEN,
  })
 
  const ORGANIZATION = `siddu-nc`;
  const REPO = `github-actions`;
  const content = generateYaml();
  await uploadToRepo(octo, `.github/workflows/schedule/`, content ,ORGANIZATION, REPO)
}

const uploadToRepo = async (
  octo,
  coursePath,
  content,
  org,
  repo,
  branch = 'master'
) => {
  // gets commit's AND its tree's SHA  
  const currentCommit = await getCurrentCommit(octo, org, repo, branch)
  const fileBlob = await (createBlobForFile(octo, org, repo,content))
  const pathForBlob = coursePath+ 'cronjob.yml';
  const newTree = await createNewTree(
    octo,
    org,
    repo,
    fileBlob,
    pathForBlob,
    currentCommit.treeSha,
  )
  const commitMessage = `Commiting schedule YAML`
  const newCommit = await createNewCommit(
    octo,
    org,
    repo,
    commitMessage,
    newTree.sha,
    currentCommit.commitSha
  )
  await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
}

const getCurrentCommit = async (
  octo,
  org,
  repo,
  branch = 'master'
) => {
  const { data: refData } = await octo.git.getRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octo.git.getCommit({
    owner: org,
    repo,
    commit_sha: commitSha,
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha,
  }
}

const createBlobForFile = async (octo, org, repo, content) => {
  const blobData = await octo.git.createBlob({
    owner: org,
    repo,
    content,
    encoding: 'utf-8',
  })
  return blobData.data
}

const createNewTree = async (
  octo,
  owner,
  repo,
  blob,
  path,
  parentTreeSha,
) => {

  try{
    const tree = [{
      path: path,
      mode: `100644`,
      type: `blob`,
      sha : blob.sha,
    }];
    
    const { data } = await octo.git.createTree({
      owner,
      repo,
      tree,
      base_tree: parentTreeSha,
    })
    return data
  }
  catch(err){
    console.error(err);
  }
}

const createNewCommit = async (
  octo,
  org,
  repo,
  message,
  currentTreeSha,
  currentCommitSha
) =>
  (await octo.git.createCommit({
    owner: org,
    repo,
    message,
    tree: currentTreeSha,
    parents: [currentCommitSha],
  })).data

const setBranchToCommit = (
  octo,
  org,
  repo,
  branch = `master`,
  commitSha
) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha,
  })


main()