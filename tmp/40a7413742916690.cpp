#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code goes here
    int n;
    vector<int> a(n);
    for (int i=0; i<n; i++) cin>>a[i];

    int mx=0;
    for (auto v: a) mx=max(mx,v);
    cout<<mx<<endl;

    return 0;
}
